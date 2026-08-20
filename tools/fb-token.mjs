/**
 * Resolves whatever Facebook token it is handed into a Page token that can
 * actually post.
 *
 * WHY: Meta's flow shows you a USER token in a big box, and hides the PAGE
 * token as one field inside the /me/accounts response. Only the second can
 * post as the Page. Everything visible pushes you toward the wrong one, and
 * the wrong one fails late and cryptically — "(#100) Tried accessing
 * nonexisting field (category)", "(#200) Unpublished posts must be posted to a
 * page as the page itself" — neither of which says "wrong kind of token".
 *
 * That mistake was made repeatedly here before this module existed. Rather
 * than keep asking a human to tell two opaque strings apart, accept either and
 * convert. A user token gets exchanged for the page token at run time; a page
 * token is used as-is. Either way the caller gets something that can post.
 *
 * The exchange costs one extra API call per run, and it also means a token
 * pasted into the wrong field still works instead of silently failing days
 * later on a scheduled job nobody is watching.
 */
const GRAPH = 'https://graph.facebook.com/v21.0';

/** Strip a token out of anything about to be printed. Graph errors echo it
 *  back inside the request url, so this is not optional. */
export const scrub = (s, token) => String(s).split(token).join('<redacted>');

/**
 * @param {string} token   either a Page token or a User token
 * @param {string} pageId  the Page it must be able to post to
 * @returns {Promise<{token: string, kind: 'page'|'user-exchanged', name: string}>}
 */
export async function resolvePageToken(token, pageId) {
  if (!token) throw new Error('no token provided');
  if (!pageId) throw new Error('no page id provided');

  /* A Page token answers /me with the Page — which has a category. A User
     token answers with a person, which does not, and Graph reports that as
     "nonexisting field (category)" rather than as a type mismatch. Asking for
     the field is the cheapest way to tell the two apart. */
  let me = null;
  try {
    const res = await fetch(`${GRAPH}/me?fields=id,name,category&access_token=${encodeURIComponent(token)}`);
    me = await res.json();
  } catch (e) {
    throw new Error(`network error identifying token: ${scrub(e.message, token)}`);
  }

  if (me?.id && me?.category) {
    if (me.id !== pageId) {
      throw new Error(`this Page token is for "${me.name}" (${me.id}), not the configured page ${pageId}`);
    }
    return { token, kind: 'page', name: me.name };
  }

  /* Not a page token. Either a user token, or genuinely broken — /me/accounts
     distinguishes those, and its error is the more useful one to surface. */
  let accounts;
  try {
    const res = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,tasks&access_token=${encodeURIComponent(token)}`);
    accounts = await res.json();
  } catch (e) {
    throw new Error(`network error listing pages: ${scrub(e.message, token)}`);
  }

  if (accounts?.error) {
    throw new Error(`token is neither a Page token nor a usable User token — ${scrub(accounts.error.message, token)}`);
  }

  const match = (accounts?.data || []).find(p => p.id === pageId);
  if (!match) {
    const names = (accounts?.data || []).map(p => `${p.name} (${p.id})`).join(', ') || 'none';
    throw new Error(`this token administers no page with id ${pageId}. Pages it can see: ${names}`);
  }

  /* CREATE_CONTENT is the task that permits posting. Without it publishing
     fails with a permissions error that reads like a bad token rather than a
     missing grant, so name it here instead. */
  if (!(match.tasks || []).includes('CREATE_CONTENT')) {
    throw new Error(`"${match.name}" lacks CREATE_CONTENT, so it cannot post. Re-generate the token with pages_manage_posts granted for that page.`);
  }

  return { token: match.access_token, kind: 'user-exchanged', name: match.name };
}

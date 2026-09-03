/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as fulfillment from "../fulfillment.js";
import type * as http from "../http.js";
import type * as lib_armorCard from "../lib/armorCard.js";
import type * as lib_commit from "../lib/commit.js";
import type * as lib_dispatch from "../lib/dispatch.js";
import type * as lib_plan from "../lib/plan.js";
import type * as lib_products from "../lib/products.js";
import type * as lib_providers from "../lib/providers.js";
import type * as lib_queue from "../lib/queue.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as orders from "../orders.js";
import type * as packs from "../packs.js";
import type * as purchases from "../purchases.js";
import type * as rateLimit from "../rateLimit.js";
import type * as stripe from "../stripe.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  fulfillment: typeof fulfillment;
  http: typeof http;
  "lib/armorCard": typeof lib_armorCard;
  "lib/commit": typeof lib_commit;
  "lib/dispatch": typeof lib_dispatch;
  "lib/plan": typeof lib_plan;
  "lib/products": typeof lib_products;
  "lib/providers": typeof lib_providers;
  "lib/queue": typeof lib_queue;
  "lib/rateLimit": typeof lib_rateLimit;
  orders: typeof orders;
  packs: typeof packs;
  purchases: typeof purchases;
  rateLimit: typeof rateLimit;
  stripe: typeof stripe;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

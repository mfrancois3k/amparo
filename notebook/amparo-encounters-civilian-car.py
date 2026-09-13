import bpy
from mathutils import Vector
removed=[]
for name in ['scene_traffic_lightbar','scene_traffic_ruby_roof_lamp','scene_traffic_blue_roof_lamp']:
 o=bpy.data.objects.get(name)
 if o:bpy.data.objects.remove(o,do_unlink=True);removed.append(name)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE'
if hasattr(s,'eevee') and hasattr(s.eevee,'taa_render_samples'):s.eevee.taa_render_samples=16
hidden=[]
for name in ['scene_door','scene_search']:
 for o in bpy.data.objects[name].children_recursive:o.hide_render=True;hidden.append(o)
cam=s.camera;cam.location=(-3.5,-8,6);cam.rotation_euler=(Vector((-8,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=7.9
s.render.resolution_x=900;s.render.resolution_y=680;s.render.film_transparent=True;s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG'
t=artifacts.file(name='amparo-encounters-poster.png',media_type='image/png');s.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
for o in hidden:o.hide_render=False
cam.location=(11,-23,18);cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=27
result={'removed_roof_lamps':removed,'poster':'isolated civilian traffic stop; no police roof lamps'}


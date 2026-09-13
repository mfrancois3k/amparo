import bpy, math
from mathutils import Vector
g=bpy.data.objects['scene_search']
p=bpy.data.objects.new('flashlight_pivot',None);bpy.context.collection.objects.link(p);p.parent=g;p.location=(1.29,-1.21,1.03)
bpy.context.view_layer.update()
for name in ['flashlight_body','flashlight_lens']:
 o=bpy.data.objects[name];world=o.matrix_world.copy();o.parent=p;o.matrix_world=world
for f,a in [(1,0),(49,.07),(97,-.035),(144,0)]:
 p.rotation_euler.y=a;p.keyframe_insert(data_path='rotation_euler',frame=f)
p.animation_data.action.name='Quiet flashlight movement'
# Portable punctual fill lights supplement the delivery softboxes.
for name,pos,energy,color in [('Portable key',(0,-5,9),1000,(1,.87,.70)),('Portable fill',(-8,3,6),500,(.64,.77,1)),('Portable right',(8,3,6),500,(1,.83,.62))]:
 d=bpy.data.lights.new(name,'POINT');d.energy=energy;d.color=color;d.shadow_soft_size=4
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos
s=bpy.context.scene;s.frame_set(1)
cam=s.camera;cam.location=(-3.5,-8,6.0);cam.rotation_euler=(Vector((-8,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=7.9
s.render.resolution_x=1100;s.render.resolution_y=850;s.render.resolution_percentage=100;s.render.film_transparent=True
# Keep the other scenes in the export; camera isolates the traffic miniature.
s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG'
target=artifacts.file(name='amparo-encounters-poster.png',media_type='image/png');s.render.filepath=target.path;bpy.ops.render.render(write_still=True);target.publish()
# Restore a triptych delivery camera for the project scene viewer.
cam.location=(11,-23,18);cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=27
result={'animated_node':'flashlight_pivot','clip':'Quiet flashlight movement','fps':24,'frames':[1,144],'poster':'traffic focused transparent PNG','mesh_count':len([o for o in bpy.data.objects if o.type=='MESH'])}


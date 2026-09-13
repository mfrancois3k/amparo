import bpy, math
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
def mat(name, rgb, rough=.65, metal=0, emission=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*rgb,1); m.use_nodes=True
 s=m.node_tree.nodes.get('Principled BSDF'); s.inputs['Base Color'].default_value=(*rgb,1); s.inputs['Roughness'].default_value=rough; s.inputs['Metallic'].default_value=metal
 if emission: s.inputs['Emission Color'].default_value=(*rgb,1); s.inputs['Emission Strength'].default_value=emission
 return m
navy=mat('Midnight blue ceramic',(0.035,.075,.135)); blue=mat('Officer slate blue',(.12,.23,.34)); tan=mat('Warm terracotta clay',(.67,.43,.25)); cream=mat('Ivory plaster',(.78,.73,.63)); gold=mat('Brushed warm brass',(.58,.37,.12),.4,.4); dark=mat('Graphite',(.025,.035,.046)); road=mat('Rain darkened asphalt',(.07,.09,.11),.38); white=mat('Warm paper',(.94,.9,.79)); seat=mat('Car camel upholstery',(.42,.28,.19)); red=mat('Restrained ruby lamp',(.45,.035,.03),.3,0,.2); cyan=mat('Restrained blue lamp',(.02,.17,.44),.3,0,.2); glow=mat('Warm lantern glass',(1,.64,.22),.35,0,1); sage=mat('Resident sage knit',(.28,.36,.29)); trim=mat('Car glazing blue',(.11,.23,.29),.22,.15)
G=None
def attach(o,name,m):
 o.name=name
 if m:o.data.materials.append(m)
 if G:o.parent=G
 return o
def box(n,p,s,m,r=.08):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=attach(bpy.context.object,n,m); o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if r:
  b=o.modifiers.new('Soft clay edges','BEVEL'); b.width=r; b.segments=3
  o.modifiers.new('Weighted studio normals','WEIGHTED_NORMAL')
 return o
def ball(n,p,s,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=p); o=attach(bpy.context.object,n,m); o.scale=s
 for f in o.data.polygons:f.use_smooth=True
 return o
def cyl(n,p,rad,depth,m,rot=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=rad,depth=depth,location=p); o=attach(bpy.context.object,n,m)
 if rot:o.rotation_euler=rot
 b=o.modifiers.new('Rolled edge','BEVEL'); b.width=.025;b.segments=2
 o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def limb(n,a,b,r,m):
 mid=(Vector(a)+Vector(b))/2; d=Vector(b)-Vector(a)
 o=ball(n,mid,(r,r,d.length/2+r*.2),m);o.rotation_euler=d.to_track_quat('Z','Y').to_euler();return o
def person(n,x,y,z,off=False,seated=False):
 skin=cream if off else tan; shirt=blue if off else sage
 ball(n+'_torso',(x,y,z+1.05),(.30,.21,.42),shirt)
 ball(n+'_head',(x,y,z+1.64),(.29,.265,.32),skin)
 cyl(n+'_neck',(x,y,z+1.31),.105,.2,skin)
 if off:
  cyl(n+'_hat_brim',(x,y,z+1.91),.37,.065,navy)
  ball(n+'_hat_crown',(x,y,z+1.98),(.275,.25,.13),navy)
  ball(n+'_badge',(x-.135,y-.203,z+1.13),(.056,.025,.071),gold)
  box(n+'_belt',(x,y,z+.78),(.53,.43,.09),dark,.025)
  box(n+'_belt_buckle',(x,y-.233,z+.78),(.095,.028,.07),gold,.01)
  for d in [-1,1]:box(n+'_pocket',(x+d*.14,y-.20,z+1.04),(.12,.028,.11),navy,.018)
 if seated:
  for d in [-1,1]:
   limb(n+'_thigh',(x+d*.15,y,z+.8),(x+d*.17,y-.43,z+.72),.145,navy)
   limb(n+'_shin',(x+d*.17,y-.43,z+.72),(x+d*.17,y-.57,z+.37),.115,navy)
   ball(n+'_shoe',(x+d*.17,y-.66,z+.28),(.14,.23,.10),dark)
   limb(n+'_sleeve',(x+d*.25,y,z+1.21),(x+d*.37,y-.27,z+1.02),.13,shirt)
   limb(n+'_forearm',(x+d*.37,y-.27,z+1.02),(x+d*.31,y-.63,z+1.18),.088,skin)
   ball(n+'_visible_hand',(x+d*.31,y-.65,z+1.19),(.095,.12,.08),skin)
 else:
  for d in [-1,1]:
   limb(n+'_leg',(x+d*.15,y,z+.8),(x+d*.18,y,z+.2),.125,navy if off else tan)
   ball(n+'_shoe',(x+d*.18,y-.09,z+.10),(.145,.23,.1),dark if off else seat)
   limb(n+'_sleeve',(x+d*.26,y,z+1.2),(x+d*.35,y-.04,z+.99),.13,shirt)
   limb(n+'_forearm',(x+d*.35,y-.04,z+.99),(x+d*.32,y-.18,z+.78),.088,skin)
   ball(n+'_hand',(x+d*.32,y-.18,z+.75),(.095,.085,.12),skin)
def base(n):
 box(n+'_plinth',(0,0,.04),(5.9,4.25,.28),navy,.22)
 box(n+'_surface',(0,0,.205),(5.65,4,.1),road,.17)
 box(n+'_brass_edge',(0,-2.075,.05),(4.2,.025,.045),gold,.015)
def car(n,cutaway=False):
 box(n+'_lower_body',(-.5,.2,.63),(3.65,1.65,.64),navy,.23)
 box(n+'_hood',(-1.60,.2,1.02),(1.15,1.62,.26),navy,.15)
 box(n+'_trunk',(.95,.2,1.02),(.65,1.62,.25),navy,.12)
 for x in [-1.65,.85]:
  for y in [-.62,1.02]:
   cyl(n+'_tyre',(x,y,.58),.38,.2,dark,(math.pi/2,0,0));cyl(n+'_rim',(x,y+(-.115 if y<0 else .115),.58),.215,.035,gold,(math.pi/2,0,0))
 box(n+'_back_seat',(.5,.25,1.08),(.65,1.12,.38),seat,.15)
 box(n+'_driver_seat',(-.25,.25,1.07),(.6,.65,.38),seat,.12)
 box(n+'_headrest',(-.25,.57,1.48),(.46,.2,.4),seat,.1)
 box(n+'_dashboard',(-.3,-.46,1.20),(1.18,.23,.22),dark,.05)
 for x in [-1.04,.72]:
  limb(n+'_far_pillar',(x,.91,1.06),(x*.8,.81,1.99),.062,navy)
 box(n+'_far_roof_rail',(-.15,.82,2.01),(1.92,.10,.09),gold,.035)
 if not cutaway:
  box(n+'_rear_roof_strip',(-.15,.62,2.06),(1.9,.50,.1),navy,.09)
  box(n+'_lightbar',(.1,.63,2.16),(.72,.22,.09),dark,.03)
  box(n+'_ruby_roof_lamp',(-.11,.63,2.23),(.27,.19,.08),red,.025)
  box(n+'_blue_roof_lamp',(.29,.63,2.23),(.27,.19,.08),cyan,.025)
 for y in [-.40,.80]:box(n+'_headlamp',(-2.342,y,.88),(.055,.28,.16),white,.035)
 box(n+'_grille',(-2.355,.2,.64),(.045,.67,.13),dark,.025)
 box(n+'_door_handle',(.55,-.636,.99),(.23,.04,.047),gold,.02)
 ball(n+'_mirror',(-.91,-.74,1.23),(.17,.13,.085),navy)
 person(n+'_driver',-.25,.13,.36,seated=True)
 # Wheel visible through the intentionally open near side.
 bpy.ops.mesh.primitive_torus_add(major_radius=.27,minor_radius=.035,major_segments=24,minor_segments=8,location=(-.25,-.56,1.56),rotation=(math.pi/2,0,0))
 attach(bpy.context.object,n+'_steering_wheel',dark)
 box(n+'_wheel_hub',(-.25,-.56,1.56),(.11,.06,.10),gold,.02)
groups=[]
for name,offset in [('scene_traffic',-8),('scene_door',0),('scene_search',8)]:
 G=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(G);G.location.x=offset;groups.append(G)
 base(name)
 if name!='scene_door':
  car(name,name=='scene_search')
  person(name+'_officer',1.6,-1.05,.25,off=True)
  for x in [-2.1,-.8,.5,1.8]:box(name+'_road_marking',(x,1.67,.266),(.68,.045,.012),cream,.006)
  if name=='scene_search':
   limb('flashlight_body',(1.29,-1.21,1.03),(.98,-1.43,.91),.08,dark)
   ball('flashlight_lens',(.97,-1.44,.91),(.078,.078,.032),glow)
  else:
   box('traffic_information_card',(1.20,-1.27,1.05),(.30,.045,.22),white,.025)
 else:
  box('house_floor',(.4,.35,.34),(4.15,3.05,.15),cream,.07)
  box('back_wall',(.4,1.70,1.65),(4.15,.18,2.7),cream,.08)
  box('right_cutaway_wall',(2.38,.60,1.18),(.18,2.15,1.75),cream,.07)
  box('porch_step',(-1.72,-.70,.30),(1.12,1.52,.12),seat,.05)
  box('entry_left_post',(-.68,-.27,1.65),(.16,.20,2.72),gold,.035)
  box('entry_right_post',(.55,-.27,1.65),(.16,.20,2.72),gold,.035)
  box('door_lintel',(-.065,-.27,2.96),(1.42,.23,.17),gold,.04)
  box('threshold',(-.065,-.27,.46),(1.3,.36,.08),gold,.025)
  door=box('closed_door_leaf',(.41,.18,1.67),(.12,1.13,2.34),navy,.05)
  ball('door_handle',(.33,-.22,1.59),(.065,.065,.065),gold)
  person('door_resident',1.15,.47,.42)
  person('door_officer',-1.50,-.55,.37,off=True)
  box('warrant_paper_prop',(-1.08,-.77,1.38),(.40,.045,.51),white,.025)
  for j in range(3):box('paper_embossed_rule',(-1.08,-.798,1.5-j*.08),(.25,.013,.016),gold,.003)
  box('lantern_mount',(.84,1.54,2.26),(.34,.07,.45),gold,.06)
  box('lantern_warm_glass',(.84,1.43,2.26),(.23,.20,.32),glow,.06)
  box('welcome_mat',(.13,-.73,.44),(.83,.52,.027),sage,.03)
  cyl('plant_pot',(1.87,-.87,.57),.22,.32,seat)
  for p in [(1.87,-.87,.98),(1.71,-.84,.87),(2.0,-.9,.87)]:ball('plant_leaf',p,(.16,.10,.26),sage)
G=None
def light(n,typ,p,power,color,target=(0,0,0),size=5):
 d=bpy.data.lights.new(n,typ);d.energy=power;d.color=color
 o=bpy.data.objects.new(n,d);bpy.context.collection.objects.link(o);o.location=p;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
 if typ=='AREA':d.shape='DISK';d.size=size
 return o
light('Key large warm softbox','AREA',(0,-8,13),2600,(1,.83,.65),size=12)
light('Cool sky fill','AREA',(-7,5,9),2100,(.58,.72,1),size=10)
light('Right rim softbox','AREA',(10,3,7),1700,(1,.77,.48),size=8)
bpy.ops.object.camera_add(location=(11,-23,18));cam=bpy.context.object;cam.name='Delivery_camera';cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=27
s=bpy.context.scene;s.camera=cam;s.render.engine='BLENDER_EEVEE';s.render.resolution_x=1440;s.render.resolution_y=720;s.render.resolution_percentage=100;s.render.film_transparent=False
s.world=bpy.data.worlds.new('Soft studio environment');s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs[0].default_value=(.13,.15,.18,1);s.world.node_tree.nodes.get('Background').inputs[1].default_value=.4
s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG'
s.render.fps=24;s.frame_start=1;s.frame_end=144
s.view_settings.view_transform='AgX'
target=artifacts.file(name='amparo-encounters-poster.png',media_type='image/png');s.render.filepath=target.path;bpy.ops.render.render(write_still=True);target.publish()
result={'groups':[{'name':g.name,'center_x':g.location.x} for g in groups],'mesh_count':len([o for o in bpy.data.objects if o.type=='MESH']),'dimensions_per_scene':[5.9,4.25,3.1],'up':'Blender Z; GLB Y','note':'No embedded textures. Matte PBR geometry.'}


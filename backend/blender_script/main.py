import bpy
import random
import sys
import os
from math import radians
# Add the directory containing the 'lens' module to the sys.path
#bpy.ops.wm.read_factory_settings(use_empty=True)
module_dir = os.path.dirname(__file__)
sys.path.append(module_dir)
from lens import Lens, LensPrescription, Prescription

def insetLens():

    rightLens = bpy.data.objects['Lens_1']
    leftLens = bpy.data.objects['Lens_2']

    rightLens.location = bpy.data.objects['Right_Eye_Location'].location
    leftLens.location = bpy.data.objects['Left_Eye_Location'].location

    #rightLens.rotation_euler = bpy.data.objects['Right_Eye_Location'].rotation_euler.copy()
    rightLens.rotation_euler.x = bpy.data.objects['Right_Eye_Location'].rotation_euler.x 
    rightLens.rotation_euler.y = bpy.data.objects['Right_Eye_Location'].rotation_euler.y 
    rightLens.rotation_euler.z = bpy.data.objects['Right_Eye_Location'].rotation_euler.z - radians(90)
    #leftLens.rotation_euler = bpy.data.objects['Left_Eye_Location'].rotation_euler.copy()
    leftLens.rotation_euler.x = bpy.data.objects['Left_Eye_Location'].rotation_euler.x 
    leftLens.rotation_euler.y = bpy.data.objects['Left_Eye_Location'].rotation_euler.y 
    leftLens.rotation_euler.z = bpy.data.objects['Left_Eye_Location'].rotation_euler.z - radians(90)

    lenses = [rightLens, leftLens]
    lenscutter = bpy.data.objects['lenscutter']

    for lens in lenses:
        bpy.context.view_layer.objects.active = lens
        lens.select_set(True)
        print(bpy.context.active_object.matrix_world.translation)

# Set the origin to the geometry center
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        print(bpy.context.active_object.matrix_world.translation)
        scale_factor = 1
        if 'max_diameter' in bpy.data.objects:
            scale_factor = lens.dimensions.y/bpy.data.objects['max_diameter'].location.x
            scale_factor *= 1.5;
        
        bool_modifier = lens.modifiers.new(name="Boolean", type='BOOLEAN')

        # Set the operation to 'INTERSECT'
        bool_modifier.operation = 'INTERSECT'

        # Set the target object for the boolean modifier
        bool_modifier.use_self = False  # This is important to specify that it uses another object
        bool_modifier.object = lenscutter

        # Apply the boolean modifier
        bpy.ops.object.modifier_apply({"object": lens}, modifier="Boolean")
        lenscutter.hide_viewport = True
        lenscutter.hide_render = True
        lenscutter.select_set(False)

# initialize empty scene and spawn a lens in it with given parameters
def startup(SPHR, SPHL, CYLR, CYLL, AXISR, AXISL, IOR, frame, PD):
    bpy.app.debug_wm = True

    # spawn a lens pair
    prescription = Prescription(
                   right_eye = LensPrescription(SPHR, CYLR, AXISR),
                   left_eye = LensPrescription(SPHL, CYLL, AXISL),
                   pupillary_distance = PD, # mm
                   index_of_refraction= IOR
    )
    bpy.context.scene.render.engine = 'CYCLES'
    prescription.generate_lens_pair(context=bpy.context, radius=bpy.data.objects['max_diameter'].location.x*0.6)

    # set object names
    lens_objects = bpy.context.scene.objects[-2:]
    lens_objects[0].name = "Lens_1"
    lens_objects[1].name = "Lens_2"

    insetLens()
    # Export lens pair
    # Assuming the lens pair objects are the last ones created
    lens_objects = [obj for obj in bpy.context.scene.objects if "Lens" in obj.name]
    for lens in lens_objects:
        lens.select_set(True)  # Select the lens object
    bpy.ops.export_scene.gltf(
        filepath="backend/models/lensOnly.glb",
        use_selection=True,  # Export only selected objects
        export_format='GLB',
        export_yup=True
    )

    # Import frame model
    #bpy.ops.import_scene.gltf(filepath="backend/models/" + frame + ".glb")
    #bpy.ops.import_scene.gltf(filepath="backend/models/round_metal_test.glb")
    objects = [obj for obj in bpy.context.scene.objects]
    for o in objects:
        #pass
        print(o)
    imported_object = bpy.context.selected_objects[0]  # Assuming the imported object is the first selected object

    # Set the imported object as the active object
    bpy.context.view_layer.objects.active = imported_object

    # Check if the object is a mesh before attempting to shade it
    if imported_object.type == 'MESH':
        bpy.ops.object.shade_smooth()
    else:
        print("The imported object is not a mesh.")

    objects = [obj for obj in bpy.context.scene.objects]
    for o in objects:
        o.select_set(True)

    bpy.data.objects['lenscutter'].select_set(False)
    filepath = "backend/models/generated.glb"  # Set the desired output file patt
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',  # Use 'GLB' format for GLB files
        use_selection=True,
        export_yup=True,  # Depending on your model orientation, adjust as needed
        export_apply=False,  # Adjust export options as needed
    )
    
    # render scene
    # filepath = "./sample.blend"
    # bpy.ops.wm.save_mainfile(filepath=filepath)

    return

if __name__ == "__main__":
    print(sys.argv)
    if len(sys.argv) < 10:
        print('shouldnt be here')
        startup(0.5, 0.5, 0, 0, 0, 0, 1.5, "aviator", 64)
    else:
        file_path = "backend/models/"+str(sys.argv[8])+"_inset.blend"
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.wm.open_mainfile(filepath=file_path)
        startup(float(sys.argv[1]), #SPHR
                float(sys.argv[2]), #SPHL
                float(sys.argv[3]), #CYLR
                float(sys.argv[4]), #CYLL
                float(sys.argv[5]), #AXISR
                float(sys.argv[6]), #AXISL
                float(sys.argv[7]), #IOR
                sys.argv[8], #frame
                float(sys.argv[9]) #PD
                )
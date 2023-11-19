import bpy
import random
import sys
import os
# Add the directory containing the 'lens' module to the sys.path
bpy.ops.wm.read_factory_settings(use_empty=True)
module_dir = os.path.dirname(__file__)
sys.path.append(module_dir)
from lens import Lens, LensPrescription, Prescription

# initialize empty scene and spawn a lens in it with given parameters
def startup(SPHR, SPHL, frame, PD):
    bpy.app.debug_wm = True

    print(SPHR, SPHL)

    # spawn a lens pair
    prescription = Prescription(
                   right_eye = LensPrescription(SPHR, 0, 0),
                   left_eye = LensPrescription(SPHL, 0, 0),
                   pupillary_distance = PD, # mm
                   index_of_refraction= 1.3

    


    )
    bpy.context.scene.render.engine = 'CYCLES'
    prescription.generate_lens_pair(context=bpy.context)

    # set object names
    lens_objects = bpy.context.scene.objects[-2:]
    lens_objects[0].name = "Lens_1"
    lens_objects[1].name = "Lens_2"

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
    bpy.ops.import_scene.gltf(filepath="backend/models/" + frame + ".glb")
    imported_object = bpy.context.selected_objects[0]  # Assuming the imported object is the first selected object

    # Set the imported object as the active object
    bpy.context.view_layer.objects.active = imported_object

    # Check if the object is a mesh before attempting to shade it
    if imported_object.type == 'MESH':
        bpy.ops.object.shade_smooth()
    else:
        print("The imported object is not a mesh.")

    filepath = "backend/models/generated.glb"  # Set the desired output file patt
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',  # Use 'GLB' format for GLB files
        export_yup=True,  # Depending on your model orientation, adjust as needed
        export_apply=False,  # Adjust export options as needed
    )
    
    # render scene
    # filepath = "./sample.blend"
    # bpy.ops.wm.save_mainfile(filepath=filepath)

    return

if __name__ == "__main__":
    print(sys.argv)
    if len(sys.argv) < 5:
        print('shouldnt be here')
        startup(0.5, 0.5, "aviator", 64)
    else:
        startup(float(sys.argv[1]), float(sys.argv[2]), sys.argv[3], float(sys.argv[4]))
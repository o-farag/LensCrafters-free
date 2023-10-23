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
def startup(SPHR, SPHL):
    bpy.app.debug_wm = True
    # starts blender without cube default scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    print(SPHR, SPHL)
    # spawn a lens pair
    prescription = Prescription(
                   right_eye= LensPrescription(SPHR, 0, 0),
                   left_eye= LensPrescription(SPHL, 0, 0),
                   pupillary_distance= 42 # mm
    )
    
    
    prescription.generate_lens_pair(context=bpy.context)

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
    if sys.argv == 1:
        print('shouldnt be here')
        startup(0.5, 0.5)
    else:
        startup(float(sys.argv[1]), float(sys.argv[2]))
import bpy
import random

# starts blender without cube default scene
bpy.ops.wm.read_factory_settings(use_empty=True) 

from lens import Lens, LensPrescription, Prescription

# initialize empty scene and spawn a lens in it with given parameters
def startup():
    bpy.app.debug_wm = True

    # spawn a lens pair
    prescription = Prescription(
                   left_eye= LensPrescription(5, 0, 0),
                   right_eye= LensPrescription(-5, 0, 0),
                   pupillary_distance= 42 # mm
    )

    prescription.generate_lens_pair(context=bpy.context)

    # render scene
    filepath = "./sample.blend"
    bpy.ops.wm.save_mainfile(filepath=filepath)
    return

if __name__ == "__main__":
    startup()
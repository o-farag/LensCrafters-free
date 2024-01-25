import bpy
import numpy as np
from dataclasses import dataclass
from dataclasses import field

from bpy.props import FloatProperty, IntProperty, EnumProperty, StringProperty, BoolProperty, FloatVectorProperty
from bpy_extras.object_utils import AddObjectHelper, object_data_add

from OptiCore import surface as sfc
from OptiCore import object_data_add
from OptiCore import utils

@dataclass
class LensPrescription:
    sphere: float = 0
    cylinder: float = 0
    axis: float = 0

@dataclass
class Prescription:
    left_eye: LensPrescription
    right_eye: LensPrescription
    pupillary_distance: float
    index_of_refraction: float = 1.5 # default ior value of glass

    def find_base_curve(self, power: float):
        base_curve = 5.0 # default value

        if power <= -10:
            base_curve = 0.5
        elif -10 < power <= -5:
            base_curve = 2.0
        elif -5 < power <= -1:
            base_curve = 4.0
        elif -1 < power <= 2:
            base_curve = 6.0
        elif 2 < power <= 4:
            base_curve = 8.0
        elif power > 4:
            base_curve = 10.0

        return base_curve


    # convert a diopter value to a radius of sphere
    def convert_diopter_to_radius(self, diopter: float, ior: float):
        if diopter == 0.0:
            return 0.0
        ior = ior #ior of glass
        # rearranged eqn for converting radius to diopter
        radius = ((ior - 1))/diopter
        # print(radius) 
        return radius

    # generate lens pair from a given prescription
    def generate_lens_pair(self, context, radius):
        # currently only supporting spherical power
        bridge_dist = self.pupillary_distance/(2*1000)
        lens_radius = radius
        center_thickness = 0 # set at 0, change if conditions don't permit 0 thickness. This minimizes thickness
        ior = self.index_of_refraction

        # left lens
        left_prescription = self.left_eye
        location = [0, bridge_dist + lens_radius, 0]  # y axis is horizontal

        # figure out base curve, which is the power of the front surface of the lens
        # the optimal base curve minimizes optical aberrations from lens 
        base_curve_power = self.find_base_curve(left_prescription.sphere)
        base_curve = self.convert_diopter_to_radius(diopter=base_curve_power, ior=ior)

        # after finding base curve, compensate for it on the back surface
        sphere_power = left_prescription.sphere
        # if (base_curve - sphere_power) > 0: # this is generally true for positive powered lenses up to +10.0 D
        sphere_power = sphere_power - base_curve_power #sphere power should be negative on back

        print(left_prescription.sphere, base_curve_power, sphere_power)

        sphere_radius = self.convert_diopter_to_radius(diopter=sphere_power, ior=ior)
        cylinder_radius = self.convert_diopter_to_radius(diopter=left_prescription.cylinder, ior=ior)
        cylinder_axis = left_prescription.axis
        
       

        # condition for checking center thickness, explanation below
        '''
        The smallest radius (highest power) the lens generator can make is equal to the lens radius. 
        Otherwise the generator breaks and generates a flat lens. For example, if we have a lens radius of 3cm, 
        then the radius of the front surface of the lens should be >=3cm, and same for the back surface. Otherwise
        we can get away with setting center-thickness to 0, in which case the generator will find the smallest thickness
        that accomodates both front and back power. 
        '''
        if (abs(sphere_radius - base_curve) < 0.005):
            center_thickness = 0.0015 # 1.5mm
        

        left_lens = Lens(rad1=base_curve, # base curve goes on front surface
                         rad2=sphere_radius,
                         cyl1=cylinder_radius,
                         axis1= cylinder_axis,
                         location=location, 
                         lensradius=lens_radius, 
                         centerthickness=center_thickness, 
                         ior=ior)
        left_lens.add_lens(context=context)
        
        # right lens
        right_prescription = self.right_eye
        location = [0, -bridge_dist - lens_radius, 0]

        base_curve_power = self.find_base_curve(right_prescription.sphere)
        base_curve = self.convert_diopter_to_radius(diopter=base_curve_power, ior=ior)

        # after finding base curve, compensate for it on the back surface
        sphere_power = right_prescription.sphere
        # if (base_curve - sphere_power) > 0: # this is generally true for positive powered lenses up to +10.0 D
        sphere_power = sphere_power - base_curve_power #sphere power should be negative on back

        print(right_prescription.sphere, base_curve_power, sphere_power)

        sphere_radius = self.convert_diopter_to_radius(diopter=sphere_power, ior=ior)
        cylinder_radius = self.convert_diopter_to_radius(diopter=right_prescription.cylinder, ior=ior)
        cylinder_axis = right_prescription.axis
        
        
        
        
        if (abs(sphere_radius - base_curve) < 0.005):
            center_thickness = 0.0015 # 1.5mm
        
        right_lens = Lens(rad1=base_curve, 
                          rad2=sphere_radius,
                          cyl1=cylinder_radius,
                          axis1=cylinder_axis, 
                          location=location, 
                          lensradius=lens_radius, 
                          centerthickness=center_thickness, 
                          ior=ior)
        right_lens.add_lens(context=context)

        lenses = [left_lens, right_lens]

        return lenses

@dataclass
class Lens():
    makedoublet: bool = False
    ltype1: str = 'spherical' 
    ltype2: str = 'spherical' 
    ltype3: str = 'spherical'
    location: tuple[float] = field(default_factory=lambda: [0, 0, 0])
    rotation: list[float] = field(default_factory=lambda: [0, 0, 0])
    rad1: float = 12.0  # spherical power front
    rad2: float = -24.0 # spherical power back
    rad3: float = 24.0
    cyl1: float = 0.0   # cylindrical power front
    cyl2: float = 0.0   # cylindrical power back
    axis1: float = 0.0  # cylinder axis front in degrees
    axis2: float = 0.0  # cylinder axis back in degrees
    num1: int = 32 
    num2: int = 64
    lensradius: float = 0.3
    flangerad1: float = 0 
    flangerad2: float = 0 
    flangerad3: float = 0
    centerthickness: float = 1.0
    centerthickness2: float = 1.0
    ASPDEG: int = 3
    k: float = 0
    A: list[float] = field(default_factory=list)
    k2: float = 0
    A2: list[float] = field(default_factory=list)
    k3: float = 0
    A3: list[float] = field(default_factory=list)
    material_name: str = ''
    material_name2: str = ''
    material_name3: str = ''
    shade_smooth: bool = True
    smooth_type: bool = True
    dshape: bool = False
    optiverts: bool = False
    debugmode: bool = False
    ior: float = 1.5
    flen_intern: float = 0
    



    def add_lens(self, context):
        edges = []
        
        srad1 = self.rad1
        srad2 = -self.rad2
        N1 = self.num1
        N2 = self.num2
        lrad = self.lensradius
        flrad1 = self.flangerad1
        flrad2 = self.flangerad2
        hasfl1 = flrad1 > 0.01*lrad
        hasfl2 = flrad2 > 0.01*lrad
        CT = self.centerthickness
        if self.ltype1 == 'aspheric':
            hasfl1 = 0 #TMP
            k = self.k
            A = self.A
        if self.ltype2 == 'aspheric':
            hasfl2 = 0 #TMP
            k2 = self.k2
            A2 = self.A2
        ssig1 = 1
        if srad1 < 0:
            ssig1 = -1
        ssig2 = 1
        if srad2 < 0:
            ssig2 = -1

        md = self.makedoublet
        if md:
            srad3 = -self.rad3
            flrad3 = self.flangerad3
            hasfl3 = flrad3 > 0.01*lrad
            CT2 = self.centerthickness2
            if self.ltype3 == 'aspheric':
                hasfl3 = 0 #TMP
                k3 = self.k3
                A3 = self.A3
            ssig3 = 1
            if srad3 < 0:
                ssig3 = -1

        #TODO: This may need to move down
        if flrad1 > 0.99*lrad: flrad1 = 0.99*lrad
        if flrad2 > 0.99*lrad: flrad2 = 0.99*lrad
        lrad1 = lrad - flrad1 if hasfl1 else lrad
        lrad2 = lrad - flrad2 if hasfl2 else lrad
        if md:
            if flrad3 > 0.99*lrad: flrad3 = 0.99*lrad
            lrad3 = lrad - flrad3 if hasfl3 else lrad
        
        #check surface radii for consistency
        ##check radius overflow
        if not utils.check_surface(np.abs(srad1), lrad1):
            srad1 = 0
            lrad1 = lrad
            hasfl1 = 0
        if not utils.check_surface(np.abs(srad2), lrad2):
            srad2 = 0
            lrad2 = lrad
            hasfl2 = 0
        if md:
            if not utils.check_surface(np.abs(srad3), lrad3):
                srad3 = 0
                lrad3 = lrad
                hasfl3 = 0
        ##check center thickness
        lsurf1, lsurf2 = 0, 0
        if not srad1 == 0:
            lsurf1 = srad1-ssig1*np.sqrt(srad1**2-lrad1**2)
        if not srad2 == 0:
            lsurf2 = srad2-ssig2*np.sqrt(srad2**2-lrad2**2)
        if (lsurf1 + lsurf2) > CT:
            CT = lsurf1 + lsurf2
        if md:
            lsurf3 = 0
            if not srad3 == 0:
                lsurf3 = srad3-ssig3*np.sqrt(srad3**2-lrad3**2)
            if (-lsurf2 + lsurf3) > CT2: CT2 = -lsurf2 + lsurf3

        #add surface1
        if srad1 == 0: #flat surface case
            verts, faces, normals = sfc.add_flat_surface(lrad1,N1,N2, dshape=self.dshape)
        elif self.ltype1 == 'spherical':
            verts, faces, normals, N1, N2 = sfc.add_spherical_surface(srad1, lrad1, N1, N2, dshape=self.dshape, optiverts=self.optiverts, lrad_ext=lrad)
        elif self.ltype1 == 'aspheric':
            verts, faces, normals = sfc.add_aspheric_surface(srad1, k, A, lrad1, N1, N2, dshape=self.dshape)

        #add flat annulus verts if needed
        #dvert = 
        #dfac = 
        
        nVerts = len(verts)
        nFacs = len(faces)
        
        #add surface2
        if srad2 == 0:#flat surface case
            dvert, dfac, normals2 = sfc.add_flat_surface(lrad2,N1,N2,-1,CT,nVerts=nVerts, dshape=self.dshape)
            #dvert = dvert[::-1]
        elif self.ltype2 == 'spherical':
            dvert, dfac, normals2, N12, N22 = sfc.add_spherical_surface(srad2, lrad2, N1, N2, -1, CT, nVerts=nVerts, dshape=self.dshape, optiverts=self.optiverts, lrad_ext=lrad)
        elif self.ltype2 == 'aspheric':
            dvert, dfac, normals2 = sfc.add_aspheric_surface(srad2, k2, A2, lrad2, N1, N2, -1, CT, nVerts=nVerts, dshape=self.dshape)
        dvert, dfac, normals2 = dvert[::-1], dfac[::-1], normals2[::-1]#for flat surface, there is only one dfac and normals are all same so it doesn't matter to leave it here

        #reverse face normals if doublet lens #TODO: check if needed for convention, in that case add to custom normals
        #if md:
        #    dfac = [f[::-1] for f in dfac]
            
        verts = verts + dvert
        faces = faces + dfac
        normals = normals + normals2

        nVerts2 = len(verts)
        ndVerts2 = len(dvert)
        nFacs2 = len(faces)
        ndFac2 = len(dfac)

        #add side
        for j in range(N2-self.dshape):
            fi1 = nVerts+(j+1)%(N2)
            fi2 = nVerts+j
            fi3 = fi2-N2
            fi4 = fi1-N2
            faces.append([fi1,fi2,fi3,fi4])
        if self.dshape:
            if srad1==0:
                ptss1 = [N2-1,0]
            else:
                ptss1 = [(x+1)*N2 for x in range(N1)[::-1]] + [0] + [x*N2+1 for x in range(N1)]
            if srad2==0:
                ptss2 = [nVerts2-N2, nVerts2-1]
            else:
                ptss2 = [nVerts + x*N2 for x in range(N1)] + [nVerts2-1] + [nVerts + (x+1)*N2-1 for x in range(N1)[::-1]]
            faces.append(ptss1 + ptss2)

        normalsside = sfc.get_ringnormals(N2, dshape=self.dshape)

        nFacSide = N2

        if md:
            #add surface3
            if srad3 == 0:
                #flat surface case
                dvert, dfac, normals3 = sfc.add_flat_surface(lrad3,N1,N2,-1,CT+CT2,nVerts=nVerts2, dshape=self.dshape)
                #dvert = dvert[::-1]
            elif self.ltype3 == 'spherical':
                dvert, dfac, normals3, N12, N22 = sfc.add_spherical_surface(srad3, lrad3, N1, N2, -1, CT+CT2, nVerts=nVerts2, dshape=self.dshape, optiverts=self.optiverts, lrad_ext=lrad)
            elif self.ltype3 == 'aspheric':
                dvert, dfac, normals3 = sfc.add_aspheric_surface(srad3, k3, A3, lrad3, N1, N2, -1, CT+CT2, nVerts=nVerts2, dshape=self.dshape)
            dvert, dfac, normals3 = dvert[::-1], dfac[::-1], normals3[::-1]
            
            verts = verts+dvert
            faces = faces+dfac
            normals = normals + normals3

            nvs1 = N2*N1+1
            if srad1 == 0:
                nvs1 = N2
            nvs2 = N2*N1+1
            if srad2 == 0:
                nvs2 = N2

            nVerts3 = len(verts)
            ndVerts3 = len(dvert)
            nFacs3 = len(faces)
            ndFac3 = len(dfac)

            #add side
            for j in range(N2-self.dshape):
                fi1 = nVerts2+(j+1)%(N2)
                fi2 = nVerts2+j
                fi3 = fi2-nvs2
                fi4 = fi1-nvs2
                faces.append([fi1,fi2,fi3,fi4])
            
            if self.dshape:
                if srad2==0:
                    ptss1 = [nvs1 + N2-1, nvs1]
                else:
                    ptss1 = [nVerts + (x+1)*N2-1 for x in range(N1)] + [nVerts2-1] + [nVerts + x*N2 for x in range(N1)[::-1]]   #[nvs1 + (x+1)*N2 for x in range(N1)[::-1]] + [nvs1] + [nvs1 + x*N2+1-N2 for x in range(N1)]
                if srad3==0:
                    ptss2 = [nVerts3-N2, nVerts3-1]
                else:
                    ptss2 = [nVerts2 + x*N2 for x in range(N1)] + [nVerts3-1] + [nVerts2 + (x+1)*N2-1 for x in range(N1)[::-1]]
                faces.append(ptss1 + ptss2)
        
        #create mesh from verts and faces
        del dvert
        del dfac
        mesh = bpy.data.meshes.new(name="New Lens")
        mesh.from_pydata(verts, edges, faces)


        # if self.material_name in bpy.data.materials:
        #     mat = bpy.data.materials[self.material_name]
        #     obj.data.materials.append(mat)
        # if md:
        #     cond2 = self.material_name2 in bpy.data.materials
        #     cond3 = self.material_name3 in bpy.data.materials
        # if md and cond2 and cond3:
        #     if self.material_name2 in bpy.data.materials:
        #         mat2 = bpy.data.materials[self.material_name2]
        #         obj.data.materials.append(mat2)
        #     if self.material_name3 in bpy.data.materials:
        #         mat3 = bpy.data.materials[self.material_name3]
        #         obj.data.materials.append(mat3)
        #     bpy.ops.object.mode_set(mode='EDIT', toggle=False)
        #     bpy.ops.mesh.select_all(action='DESELECT')
        #     sel_mode = bpy.context.tool_settings.mesh_select_mode
        #     bpy.context.tool_settings.mesh_select_mode = [False, False, True]
        #     bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
        #     #rear surface (mat3)
        #     for i in range(nFacSide):
        #         mesh.polygons[i + nFacs3].select=True
        #     for i in range(ndFac3):
        #         mesh.polygons[i + nFacs2+ nFacSide].select=True
        #     bpy.ops.object.mode_set(mode='EDIT', toggle=False)
        #     bpy.context.tool_settings.mesh_select_mode = sel_mode
        #     obj.active_material_index = 2
        #     bpy.ops.object.material_slot_assign()
        #     bpy.ops.mesh.select_all(action='DESELECT')
        #     bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
        #     #middle surface (mat2)
        #     for i in range(ndFac2):
        #         mesh.polygons[i + nFacs].select=True
        #     bpy.ops.object.mode_set(mode='EDIT', toggle=False)
        #     bpy.context.tool_settings.mesh_select_mode = sel_mode
        #     obj.active_material_index = 1
        #     bpy.ops.object.material_slot_assign()
        #     bpy.ops.object.mode_set(mode='OBJECT', toggle=False)

        #apply smooth shading
        

        if self.shade_smooth and False:
            bpy.ops.object.shade_smooth()
            mesh.use_auto_smooth = True
            if self.smooth_type: #assign custom normals
                # bpy.ops.mesh.customdata_custom_splitnormals_clear()
                # bpy.ops.mesh.customdata_custom_splitnormals_add()
                cn1, cn2, cn3, cn4, cn5 = [], [], [], [], []
                #surf1
                if srad1 == 0:
                    nloops1 = N2
                    nloops1_fl = N2
                else:
                    nloops1 = (N2-self.dshape)*(3 + 4*(N1-1))
                    nloops1_fl = nloops1 - 2*hasfl1*(3 + 4*(N1-1)+1)
                for i in range(nloops1_fl):
                    vi = mesh.loops[i].vertex_index
                    cn1.append(normals[vi])
                if hasfl1:
                    for i in range(2*(3 + 4*(N1-1))+2):
                        vi = mesh.loops[nloops1_fl + i].vertex_index
                        cn1.append(normals[nVerts-1])
                #surf2
                if srad2 == 0:
                    nloops2 = N2
                    d_fl = 0
                    nloops2_fl = N2
                else:
                    nloops2 = (N2-self.dshape)*(3 + 4*(N1-1))
                    d_fl = 2*hasfl2*(3 + 4*(N1-1)+1)
                    nloops2_fl = nloops2 - 2*hasfl2*(3 + 4*(N1-1)+1)
                if hasfl2:
                    for i in range(d_fl):
                        vi = mesh.loops[nloops2_fl + i + nloops1].vertex_index
                        cn2.append(normals[nVerts2-1])
                for i in range(d_fl, nloops2):
                    vi = mesh.loops[i + nloops1].vertex_index
                    cn2.append(normals[vi])
                #edge12
                nloops3 = 4*(N2-self.dshape)
                for i in range(nloops3):
                    vi = mesh.loops[i + nloops1 + nloops2].vertex_index
                    if vi < nVerts:
                        vi = vi - nVerts + N2
                    else:
                        vi = vi - nVerts
                    cn3.append(normalsside[vi])
                #Dface
                if self.dshape:
                    if srad1 == 0:
                        nloopsd1 = 1
                    else:
                        nloopsd1 = 2*N1
                    if srad2 == 0:
                        nloopsd2 = 1
                    else:
                        nloopsd2 = 2*N1
                    for i in range(nloopsd1 + nloopsd2 + 2):
                        cn3.append((0,-1,0))
                    nloops3 += nloopsd1 + nloopsd2 + 2
                if md:
                    #surf3
                    if srad3 == 0:
                        nloops4 = N2
                        d_fl = 0
                        nloops4_fl = N2
                    else:
                        nloops4 = (N2-self.dshape)*(3 + 4*(N1-1))
                        d_fl = 2*hasfl3*(3 + 4*(N1-1)+1)
                        nloops4_fl = nloops4 - 2*hasfl3*(3 + 4*(N1-1)+1)
                    if hasfl3:
                        for i in range(d_fl):
                            vi = mesh.loops[nloops4_fl + i + nloops1 + nloops2 + nloops3].vertex_index
                            cn4.append(normals[nVerts3-1])
                    for i in range(d_fl, nloops4):
                        vi = mesh.loops[i + nloops1 + nloops2 + nloops3].vertex_index
                        cn4.append(normals[vi])
                    """
                    #surf3
                    if srad3 == 0:
                        nloops4 = N2
                    else:
                        nloops4 = (N2-self.dshape)*(3 + 4*(N1-1))
                    for i in range(nloops4):
                        vi = mesh.loops[i + nloops1 + nloops2 + nloops3].vertex_index
                        cn4.append(normals[vi])
                    """
                    #edge23
                    nloops5 = 4*(N2-self.dshape)
                    for i in range(nloops5):
                        vi = mesh.loops[i + nloops1 + nloops2 + nloops3 + nloops4].vertex_index
                        if vi < nVerts2:
                            vi = vi - nVerts
                        else:
                            vi = vi - nVerts2
                        cn5.append(normalsside[vi])
                    #Dface2
                    if self.dshape:
                        if srad3 == 0:
                            nloopsd3 = 1
                        else:
                            nloopsd3 = 2*N1
                        for i in range(nloopsd2 + nloopsd3 + 2):
                            cn5.append((0,-1,0))
                mesh.normals_split_custom_set(cn1 + cn2 + cn3 + cn4 + cn5)

        #compute optical parameters
        if not md:
            self.flen_intern = utils.lens_math.f_lensmaker(self.rad1, self.rad2, self.ior, self.centerthickness)
                
        #for testing
        if self.debugmode:
            mesh.calc_normals_split()
            bpy.ops.object.mode_set(mode='EDIT', toggle=False)
            bpy.ops.mesh.select_all(action='DESELECT')

        # used for moving lens later, and for boolean and remesh modifier
        obj = bpy.data.objects.new(name="New Lens", object_data=mesh)
        bpy.context.view_layer.active_layer_collection.collection.objects.link(obj)
        
        # use generated mesh for adding cylinder power when power is not 0
        # TODO: change condition, cylinder is currently disabled
        self.cyl1 = 0
        if self.cyl1 != 0:
            # create cylinder with radius corresponding to correct cylinder power
            # cylinder is already object, so no need to set it to variable
            bpy.ops.mesh.primitive_cylinder_add(
                            vertices = 2048, # need a lot of vertices for smooth curve
                            radius = abs(self.cyl1), # abs for positive value
                            end_fill_type = 'TRIFAN'
            )
            cyl = bpy.context.selected_objects[0] # already selected after creation

            # cylinder dimensions will be much larger from default creation (height = 1m)

            # align cylinder with middle of lens, align front or back surface
            offset = self.location # offset for each lens's location

            dimensions = obj.dimensions
            cyl.location = [-self.cyl1 - dimensions.x/2, 0, 0] # for now align with back surface
            
            cyl.rotation_euler = [np.radians(self.axis1), 0, 0]

            # use boolean modifier with union, then apply modifier
            bool_mod = obj.modifiers.new(name="Boolean", type='BOOLEAN')
            bool_mod.operation = 'DIFFERENCE'
            bool_mod.object = cyl
            bool_mod.solver = 'EXACT'
            
            # remesh modifier for smoother, higher poly lens
            # remesh_mod = obj.modifiers.new(name="Remesh", type='REMESH')
            # remesh_mod.mode = 'SHARP'
            # remesh_mod.octree_depth = 7
            # remesh_mod.scale = 0.99

            # apply modifiers
            # obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_apply(modifier="Boolean")
            # bpy.ops.object.modifier_apply(modifier="Remesh")

            # after applying modifiers, move cylinders to align with left/right lens positions
            cyl.location[0] += offset[0]
            cyl.location[1] += offset[1]
            cyl.location[2] += offset[2]

            # delete cylinder
            bpy.context.view_layer.objects.active = cyl
            bpy.ops.object.delete()

        

        # move lenses after all generation and mesh manipulation is done
        # create object
        # obj = object_data_add(context, mesh, operator=self)
        obj.location = self.location
        obj.rotation_euler = self.rotation
        
        obj.select_set(state=True)

        #assign material(s) using principled bsdf
        mat = bpy.data.materials.new(name="Lens Material")
        mat.use_nodes = True
        node_tree = mat.node_tree
        nodes = node_tree.nodes
        bsdf = nodes.get("Principled BSDF")

        # set material params
        bsdf.inputs["Transmission"].default_value = 1.0
        bsdf.inputs["IOR"].default_value = self.ior
        bsdf.inputs['Metallic'].default_value = 0.0
        bsdf.inputs["Specular"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.0
        bsdf.inputs["Sheen Tint"].default_value  = 0.0


        assert(bsdf)

        # add material to object
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)    

        # created cylindrical lens by calculating a union between a flat lens
        # and a cylinder with given parameters
        # def add_cylindrical_lens(cyl_rad, lrad, N1, N2):
            # create the lens with correct spherical power

            # create cylinder corresponding to correct cylinder power

            # make cylinder dimensions much larger than lens dimensions

            # align cylinder with middle of lens, align front or back surface

            # use boolean modifier with union, then apply modifier

            # retopologize mesh?
            # return
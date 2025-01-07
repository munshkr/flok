const wrapperContent = `
# *****************************************************************************
#
#   Part of the py5 library
#   Copyright (C) 2020-2024 Jim Schmitz
#
#   This library is free software: you can redistribute it and/or modify it
#   under the terms of the GNU Lesser General Public License as published by
#   the Free Software Foundation, either version 2.1 of the License, or (at
#   your option) any later version.
#
#   This library is distributed in the hope that it will be useful, but
#   WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
#   General Public License for more details.
#
#   You should have received a copy of the GNU Lesser General Public License
#   along with this library. If not, see <https://www.gnu.org/licenses/>.
#
# *****************************************************************************

# This pyp5js version is adapted to be more similar to py5 (py5coding.org)
# by Alexandre B A Villares - https://abav.lugaralgum.com

import builtins
import operator
import re
import types
import warnings
import weakref
from collections.abc import Iterable, Sequence
from numbers import Number
from random import randint

import numpy as np

_P5_INSTANCE = None

_CTX_MIDDLE = None
_DEFAULT_FILL = None
_DEFAULT_LEADMULT = None
_DEFAULT_STROKE = None
_DEFAULT_TEXT_FILL = None

ADD = None
ALT = None
ARROW = None
AUDIO = None
AUTO = None
AXES = None
BACKSPACE = None
BASELINE = None
BEVEL = None
BEZIER = None
BLEND = None
BLUR = None
BOLD = None
BOLDITALIC = None
BOTTOM = None
BURN = None
CENTER = None
CHORD = None
CLAMP = None
CLOSE = None
CONTROL = None
CORNER = None
CORNERS = None
CROSS = None
CURVE = None
DARKEST = None
DEG_TO_RAD = None
DEGREES = None
DELETE = None
DIFFERENCE = None
DILATE = None
DODGE = None
DOWN_ARROW = None
ENTER = None
ERODE = None
ESCAPE = None
EXCLUSION = None
FILL = None
GRAY = None
GRID = None
HALF_PI = None
HAND = None
HARD_LIGHT = None
HSB = None
HSL = None
IMAGE = None
IMMEDIATE = None
INVERT = None
ITALIC = None
LANDSCAPE = None
LEFT = None
LEFT_ARROW = None
LIGHTEST = None
LINE_LOOP = None
LINE_STRIP = None
LINEAR = None
LINES = None
MIRROR = None
MITER = None
MOVE = None
MULTIPLY = None
NEAREST = None
NORMAL = None
OPAQUE = None
OPEN = None
OPTION = None
OVERLAY = None
PI = None
PIE = None
POINTS = None
PORTRAIT = None
POSTERIZE = None
PROJECT = None
QUAD_STRIP = None
QUADRATIC = None
QUADS = None
QUARTER_PI = None
RAD_TO_DEG = None
RADIANS = None
RADIUS = None
REPEAT = None
REPLACE = None
RETURN = None
RGB = None
RIGHT = None
RIGHT_ARROW = None
ROUND = None
SCREEN = None
SHIFT = None
SOFT_LIGHT = None
SQUARE = None
STROKE = None
SUBTRACT = None
TAB = None
TAU = None
TEXT = None
TEXTURE = None
THRESHOLD = None
TOP = None
TRIANGLE_FAN = None
TRIANGLE_STRIP = None
TRIANGLES = None
TWO_PI = None
UP_ARROW = None
VIDEO = None
WAIT = None
WEBGL = None
P2D = None
PI = None

frame_count = None
focused = None
display_width = None
display_height = None
window_width = None
window_height = None
width = None
height = None
device_orientation = None
acceleration_x = None
acceleration_y = None
acceleration_z = None
p_acceleration_x = None
p_acceleration_y = None
p_acceleration_z = None
rotation_x = None
rotation_y = None
rotation_z = None
p_rotation_x = None
p_rotation_y = None
p_rotation_z = None
turn_axis = None
is_key_pressed = None
key = None
key_code = None
mouse_x = None
mouse_y = None
pmouse_x = None
pmouse_y = None
win_mouse_x = None
win_mouse_y = None
pwin_mouse_x = None
pwin_mouse_y = None
mouse_button = None
is_mouse_pressed = None
touches = None
pixels = None


def alpha(*args):
    return _P5_INSTANCE.alpha(*args)

def blue(*args):
    return _P5_INSTANCE.blue(*args)

def brightness(*args):
    return _P5_INSTANCE.brightness(*args)

def color(*args):
    return _P5_INSTANCE.color(*args)

def green(*args):
    return _P5_INSTANCE.green(*args)

def hue(*args):
    return _P5_INSTANCE.hue(*args)

def lerp_color(*args):
    return _P5_INSTANCE.lerpColor(*args)

def lightness(*args):
    return _P5_INSTANCE.lightness(*args)

def red(*args):
    return _P5_INSTANCE.red(*args)

def saturation(*args):
    return _P5_INSTANCE.saturation(*args)

def background(*args):
    return _P5_INSTANCE.background(*args)

def clear(*args):
    return _P5_INSTANCE.clear(*args)

def erase(*args):
    return _P5_INSTANCE.erase(*args)

def no_erase(*args):
    return _P5_INSTANCE.noErase(*args)

def color_mode(*args):
    if args == [HSB]:  # py5 compatibility
      return _P5_INSTANCE.colorMode(HSB, 255, 255, 255, 255)
    return _P5_INSTANCE.colorMode(*args)

def fill(*args):
    return _P5_INSTANCE.fill(*args)

def no_fill(*args):
    return _P5_INSTANCE.noFill(*args)

def no_stroke(*args):
    return _P5_INSTANCE.noStroke(*args)

def stroke(*args):
    return _P5_INSTANCE.stroke(*args)

def arc(*args):
    return _P5_INSTANCE.arc(*args)

def ellipse(*args):
    return _P5_INSTANCE.ellipse(*args)

def circle(*args):
    return _P5_INSTANCE.circle(*args)

def line(*args):
    return _P5_INSTANCE.line(*args)

def point(*args):
    return _P5_INSTANCE.point(*args)

# py5 compatibility
def lines(arg):
     for a, b in arg:
         line(*a, *b)

def points(arg):
    for p in arg:
        point(*p)

def vertices(arg):
    for v in arg:
        vertex(*v)

def lines(arg):
    for li in arg:
        line(*li)

def quad(*args):
    return _P5_INSTANCE.quad(*args)

def rect(*args):
    return _P5_INSTANCE.rect(*args)

def square(*args):
    return _P5_INSTANCE.square(*args)

def triangle(*args):
    return _P5_INSTANCE.triangle(*args)

def plane(*args):
    return _P5_INSTANCE.plane(*args)

def box(*args):
    return _P5_INSTANCE.box(*args)

def sphere(*args):
    return _P5_INSTANCE.sphere(*args)

def cylinder(*args):
    return _P5_INSTANCE.cylinder(*args)

def cone(*args):
    return _P5_INSTANCE.cone(*args)

def ellipsoid(*args):
    return _P5_INSTANCE.ellipsoid(*args)

def torus(*args):
    return _P5_INSTANCE.torus(*args)

def load_model(*args):
    return _P5_INSTANCE.loadModel(*args)

def model(*args):
    return _P5_INSTANCE.model(*args)

def ellipse_mode(*args):
    return _P5_INSTANCE.ellipseMode(*args)

def no_smooth(*args):
    return _P5_INSTANCE.noSmooth(*args)

def rect_mode(*args):
    return _P5_INSTANCE.rectMode(*args)

def smooth(*args):
    return _P5_INSTANCE.smooth(*args)

def stroke_cap(*args):
    return _P5_INSTANCE.strokeCap(*args)

def stroke_join(*args):
    return _P5_INSTANCE.strokeJoin(*args)

def stroke_weight(*args):
    return _P5_INSTANCE.strokeWeight(*args)

def bezier(*args):
    return _P5_INSTANCE.bezier(*args)

def bezier_detail(*args):
    return _P5_INSTANCE.bezierDetail(*args)

def bezier_point(*args):
    return _P5_INSTANCE.bezierPoint(*args)

def bezier_tangent(*args):
    return _P5_INSTANCE.bezierTangent(*args)

def bezier_vertex(*args):
    return _P5_INSTANCE.bezierVertex(*args)

def bezier_vertices(coordinates, /):
    if isinstance(coordinates, types.GeneratorType):
        coordinates = builtins.list(coordinates)
    if not len(coordinates):
        return

    if len(coordinates[0]) == 6:
        for c in coordinates:
            bezier_vertex(c[0], c[1], c[2], c[3], c[4], c[5])
    elif len(coordinates[0]) == 9:
        for c in coordinates:
            bezier_vertex(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8])
    else:
        raise RuntimeError("the second axis of parameter coordinates must have a length equal to 6 or 9")

def curve(*args):
    return _P5_INSTANCE.curve(*args)

def curve_detail(*args):
    return _P5_INSTANCE.curveDetail(*args)

def curve_tightness(*args):
    return _P5_INSTANCE.curveTightness(*args)

def curve_point(*args):
    return _P5_INSTANCE.curvePoint(*args)

def curve_tangent(*args):
    return _P5_INSTANCE.curveTangent(*args)

class begin_contour():
    def __init__(self):
        _P5_INSTANCE.beginContour()

    def __enter__(self):
        pass

    def __exit__(self,  exc_type, exc_value, exc_tb):
        _P5_INSTANCE.endContour()

class begin_shape():
    def __init__(self, *args):
        _P5_INSTANCE.beginShape(*args)

    def __enter__(self):
        pass

    def __exit__(self,  exc_type, exc_value, exc_tb):
        _P5_INSTANCE.endShape()

class begin_closed_shape():
    def __init__(self):
        _P5_INSTANCE.beginShape()

    def __enter__(self):
        pass

    def __exit__(self,  exc_type, exc_value, exc_tb):
        _P5_INSTANCE.endShape(CLOSE)

def curve_vertex(*args):
    return _P5_INSTANCE.curveVertex(*args)

def curve_vertices(coordinates, /):
    if isinstance(coordinates, types.GeneratorType):
        coordinates = builtins.list(coordinates)
    if not len(coordinates):
        return

    if len(coordinates[0]) == 2:
        for c in coordinates:
            curve_vertex(c[0], c[1])
    elif len(coordinates[0]) == 3:
        for c in coordinates:
            curve_vertex(c[0], c[1], c[2])
    else:
        raise RuntimeError("the second axis of parameter coordinates must have a length equal to 2 or 3")

def end_contour(*args):
    return _P5_INSTANCE.endContour(*args)

def end_shape(*args):
    return _P5_INSTANCE.endShape(*args)

def quadratic_vertex(*args):
    return _P5_INSTANCE.quadraticVertex(*args)

def quadratic_vertices(coordinates, /):
    if isinstance(coordinates, types.GeneratorType):
        coordinates = builtins.list(coordinates)
    if not len(coordinates):
        return

    if len(coordinates[0]) == 4:
        for c in coordinates:
            quadratic_vertex(c[0], c[1], c[2], c[3])
    elif len(coordinates[0]) == 6:
        for c in coordinates:
            quadratic_vertex(c[0], c[1], c[2], c[3], c[4], c[5])
    else:
        raise RuntimeError("the second axis of parameter coordinates must have a length equal to 4 or 6")

def vertex(*args):
    return _P5_INSTANCE.vertex(*args)

def cursor(*args):
    return _P5_INSTANCE.cursor(*args)

def frame_rate(*args):
    return _P5_INSTANCE.frameRate(*args)

def get_frame_rate(*args):
    return _P5_INSTANCE.getFrameRate(*args)

def no_cursor(*args):
    return _P5_INSTANCE.noCursor(*args)

def fullscreen(*args):
    return _P5_INSTANCE.fullscreen(*args)

def pixel_density(*args):
    return _P5_INSTANCE.pixelDensity(*args)

def display_density(*args):
    return _P5_INSTANCE.displayDensity(*args)

def getURL(*args):
    return _P5_INSTANCE.getURL(*args)

def getURLPath(*args):
    return _P5_INSTANCE.getURLPath(*args)

def getURLParams(*args):
    return _P5_INSTANCE.getURLParams(*args)

def remove(*args):
    return _P5_INSTANCE.remove(*args)

def no_loop(*args):
    return _P5_INSTANCE.noLoop(*args)

def loop(*args):
    return _P5_INSTANCE.loop(*args)

class push():
    def __init__(self):
        _P5_INSTANCE.push()

    def __enter__(self):
        pass

    def __exit__(self,  exc_type, exc_value, exc_tb):
        _P5_INSTANCE.pop()

def redraw(*args):
    return _P5_INSTANCE.redraw(*args)

def resize_canvas(*args):
    return _P5_INSTANCE.resizeCanvas(*args)

def no_canvas(*args):
    return _P5_INSTANCE.noCanvas(*args)

def create_graphics(*args):
    return _P5_INSTANCE.createGraphics(*args)

def blend_mode(*args):
    return _P5_INSTANCE.blendMode(*args)

def set_attributes(*args):
    return _P5_INSTANCE.setAttributes(*args)

def apply_matrix(*args):
    return _P5_INSTANCE.applyMatrix(*args)

def reset_matrix(*args):
    return _P5_INSTANCE.resetMatrix(*args)

def rotate(*args):
    return _P5_INSTANCE.rotate(*args)

def rotate_x(*args):
    return _P5_INSTANCE.rotateX(*args)

def rotate_y(*args):
    return _P5_INSTANCE.rotateY(*args)

def rotate_z(*args):
    return _P5_INSTANCE.rotateZ(*args)

def scale(*args):
    return _P5_INSTANCE.scale(*args)

def shear_x(*args):
    return _P5_INSTANCE.shearX(*args)

def shear_y(*args):
    return _P5_INSTANCE.shearY(*args)

def translate(*args):
    return _P5_INSTANCE.translate(*args)

def create_string_dict(*args):
    return _P5_INSTANCE.createStringDict(*args)

def create_number_dict(*args):
    return _P5_INSTANCE.createNumberDict(*args)

def append(*args):
    return _P5_INSTANCE.append(*args)

def array_copy(*args):
    return _P5_INSTANCE.arrayCopy(*args)

def concat(*args):
    return _P5_INSTANCE.concat(*args)

def reverse(*args):
    return _P5_INSTANCE.reverse(*args)

def shorten(*args):
    return _P5_INSTANCE.shorten(*args)

def shuffle(*args):
    return _P5_INSTANCE.shuffle(*args)

def sort(*args):
    return _P5_INSTANCE.sort(*args)

def splice(*args):
    return _P5_INSTANCE.splice(*args)

def subset(*args):
    return _P5_INSTANCE.subset(*args)

def float(*args):
    return _P5_INSTANCE.float(*args)

def int(*args):
    return _P5_INSTANCE.int(*args)

def str(*args):
    return _P5_INSTANCE.str(*args)

def boolean(*args):
    return _P5_INSTANCE.boolean(*args)

def byte(*args):
    return _P5_INSTANCE.byte(*args)

def char(*args):
    return _P5_INSTANCE.char(*args)

def unchar(*args):
    return _P5_INSTANCE.unchar(*args)

def hex(*args):
    return _P5_INSTANCE.hex(*args)

def unhex(*args):
    return _P5_INSTANCE.unhex(*args)

def join(*args):
    return _P5_INSTANCE.join(*args)

def match(*args):
    return _P5_INSTANCE.match(*args)

def match_all(*args):
    return _P5_INSTANCE.matchAll(*args)

def nf(*args):
    return _P5_INSTANCE.nf(*args)

def nfc(*args):
    return _P5_INSTANCE.nfc(*args)

def nfp(*args):
    return _P5_INSTANCE.nfp(*args)

def nfs(*args):
    return _P5_INSTANCE.nfs(*args)

def split(*args):
    return _P5_INSTANCE.split(*args)

def split_tokens(*args):
    return _P5_INSTANCE.splitTokens(*args)

def trim(*args):
    return _P5_INSTANCE.trim(*args)

def setMoveThreshold(*args):
    return _P5_INSTANCE.setMoveThreshold(*args)

def setShakeThreshold(*args):
    return _P5_INSTANCE.setShakeThreshold(*args)

def key_is_down(*args):
    return _P5_INSTANCE.keyIsDown(*args)

def create_image(*args):
    return _P5_INSTANCE.createImage(*args)

def save_canvas(*args):
    return _P5_INSTANCE.saveCanvas(*args)

def save_frames(*args):
    return _P5_INSTANCE.saveFrames(*args)

def load_image(*args):
    return _P5_INSTANCE.loadImage(*args)

def image(*args):
    return _P5_INSTANCE.image(*args)

def tint(*args):
    return _P5_INSTANCE.tint(*args)

def no_tint(*args):
    return _P5_INSTANCE.noTint(*args)

def image_mode(*args):
    return _P5_INSTANCE.imageMode(*args)

def blend(*args):
    return _P5_INSTANCE.blend(*args)

def copy(*args):
    return _P5_INSTANCE.copy(*args)

def apply_filter(*args):
    return _P5_INSTANCE.filter(*args)

def get(*args):
    return _P5_INSTANCE.get(*args)

def load_pixels(*args):
    return _P5_INSTANCE.loadPixels(*args)

def set_pixel(*args):
    return _P5_INSTANCE.set(*args)

def update_pixels(*args):
    return _P5_INSTANCE.updatePixels(*args)

def __load(path, **kwargs):
    import re
    from urllib.parse import urljoin

    import requests

    if isinstance(path, builtins.str) and re.match(r"https?://", path.lower()):
        url = path
    else:
        href = window.location.href
        url = urljoin(href.replace(href.split('/')[-1], ''), path)

    response = requests.get(url, **kwargs)
    if response.status_code != 200:
        raise RuntimeError("Unable to download URL: " + response.reason)
    return response

def load_json(json_path, **kwargs):
    return __load(json_path, **kwargs).json()

def load_strings(string_path, **kwargs):
    return __load(string_path, **kwargs).text.splitlines()

def load_bytes(bytes_path, **kwargs):
    return bytearray(__load(bytes_path, **kwargs).content)

def load_table(*args):
    return _P5_INSTANCE.loadTable(*args)

def loadXML(*args):
    return _P5_INSTANCE.loadXML(*args)

def parse_json(serialized_json, **kwargs):
    import json
    return json.loads(serialized_json, **kwargs)

def create_writer(*args):
    return _P5_INSTANCE.createWriter(*args)

def save(*args):
    return _P5_INSTANCE.save(*args)

def save_json(*args):
    return _P5_INSTANCE.saveJSON(*args)

def save_strings(*args):
    return _P5_INSTANCE.saveStrings(*args)

def save_table(*args):
    return _P5_INSTANCE.saveTable(*args)

def day(*args):
    return _P5_INSTANCE.day(*args)

def hour(*args):
    return _P5_INSTANCE.hour(*args)

def minute(*args):
    return _P5_INSTANCE.minute(*args)

def millis(*args):
    return _P5_INSTANCE.millis(*args)

def month(*args):
    return _P5_INSTANCE.month(*args)

def second(*args):
    return _P5_INSTANCE.second(*args)

def year(*args):
    return _P5_INSTANCE.year(*args)

def create_vector(*args):
    return _P5_INSTANCE.createVector(*args)

def abs(*args):
    return _P5_INSTANCE.abs(*args)

def ceil(*args):
    return _P5_INSTANCE.ceil(*args)

def constrain(*args):
    return _P5_INSTANCE.constrain(*args)

def dist(*args):
    return _P5_INSTANCE.dist(*args)

def exp(*args):
    return _P5_INSTANCE.exp(*args)

def floor(*args):
    return _P5_INSTANCE.floor(*args)

def lerp(*args):
    return _P5_INSTANCE.lerp(*args)

def log(*args):
    return _P5_INSTANCE.log(*args)

def mag(*args):
    return _P5_INSTANCE.mag(*args)

def remap(value, start1, stop1, start2, stop2):
    denom = stop1 - start1
    if denom == 0:
        print(
            f"remap({value}, {start1}, {stop1}, {start2}, {stop2}) called, which returns NaN (not a number)",
            stacklevel=_non_py5_stacklevel(),
        )
        return float("nan")
    else:
        return start2 + (stop2 - start2) * ((value - start1) / denom)

def norm(*args):
    return _P5_INSTANCE.norm(*args)

def pow(*args):
    return _P5_INSTANCE.pow(*args)

def round(*args):
    return _P5_INSTANCE.round(*args)

def sq(*args):
    return _P5_INSTANCE.sq(*args)

def sqrt(*args):
    return _P5_INSTANCE.sqrt(*args)

def __noise_array(*args):
    out = []
    if len(args) == 1:
        print(1)
        x = args[0]
        for i in range(len(x)):
            out.append(noise(x[i]))
    elif len(args) == 2:
        x, y = args[0], args[1]
        for i in range(len(x)):
            out.append(noise(x[i], y[i]))
    elif len(args) == 3:
        print(3)
        x, y, z = args[0], args[1], args[2]
        for i in range(len(x)):
            out.append(noise(x[i], y[i], z[i]))
    return out

def noise(*args):
    if any(isinstance(arg, np.ndarray) for arg in args):
        arrays = np.broadcast_arrays(*args)
        return np.array(
            __noise_array(*[a.flatten() for a in arrays])
        ).reshape(arrays[0].shape)
    else:
        return _P5_INSTANCE.noise(*args)

def noise_detail(*args):
    return _P5_INSTANCE.noiseDetail(*args)

def noise_seed(*args):
    return _P5_INSTANCE.noiseSeed(*args)

class _DefaultPrinter:
    def print(self, *args, **kwargs):
        kwargs.pop('stderr')
        builtins.print(*args, **kwargs)

_println_stream = _DefaultPrinter()

def set_println_stream(println_stream):
    global _println_stream
    _println_stream = println_stream

def println(*args, sep=" ", end="\\n", stderr=False):
    msg = sep.join(str(x) for x in args)
    _println_stream.print(msg, end=end, stderr=stderr)

np_random = np.random.default_rng()

def random_seed(seed):
    global np_random
    np_random = np.random.default_rng(seed)

def random(*args):
    if len(args) == 0:
        return np_random.uniform()
    elif len(args) == 1:
        high = args[0]
        if isinstance(high, (builtins.int, np.integer, builtins.float)):
            return np_random.uniform(0, high)
    elif len(args) == 2:
        low, high = args
        if isinstance(low, (builtins.int, np.integer, builtins.float)) and isinstance(
            high, (builtins.int, np.integer, builtins.float)
        ):
            return np_random.uniform(low, high)

    types = ",".join([type(a).__name__ for a in args])
    raise TypeError(f"No matching overloads found for Sketch.random({types})")

def random_int(*args):
    if len(args) == 0:
        return np_random.integers(0, 1, endpoint=True)
    elif len(args) == 1:
        high = args[0]
        if isinstance(high, (builtins.int, np.integer)):
            return np_random.integers(0, high, endpoint=True)
    elif len(args) == 2:
        low, high = args
        if isinstance(low, (builtins.int, np.integer)) and isinstance(
            high, (builtins.int, np.integer)
        ):
            return np_random.integers(low, high, endpoint=True)

    types = ",".join([type(a).__name__ for a in args])
    raise TypeError(f"No matching overloads found for Sketch.random_int({types})")

def random_choice(objects):
    if len(objects):
        return objects[np_random.integers(0, len(objects))]

def random_sample(objects, size=1, replace=True):
    if len(objects):
        if isinstance(objects, types.GeneratorType):
            objects = list(objects)
        indices = np_random.choice(range(len(objects)), size=size, replace=replace)
        if not isinstance(objects, builtins.list):
            try:
                return objects[indices]
            except:
                pass
        return [objects[idx] for idx in indices]
    else:
        return []

def random_gaussian(*args):
    if len(args) == 0:
        return np_random.normal()
    elif len(args) == 1:
        loc = args[0]
        if isinstance(loc, (builtins.int, np.integer)):
            return np_random.normal(loc)
    elif len(args) == 2:
        loc, scale = args
        if isinstance(loc, (builtins.int, np.integer, builtins.float)) and isinstance(
            scale, (builtins.int, np.integer, builtins.float)
        ):
            return np_random.normal(loc, scale)

    types = ",".join([type(a).__name__ for a in args])
    raise TypeError(
        f"No matching overloads found for Sketch.random_gaussian({types})"
    )

def acos(*args):
    return _P5_INSTANCE.acos(*args)

def asin(*args):
    return _P5_INSTANCE.asin(*args)

def atan(*args):
    return _P5_INSTANCE.atan(*args)

def atan2(*args):
    return _P5_INSTANCE.atan2(*args)

def cos(*args):
    return _P5_INSTANCE.cos(*args)

def sin(*args):
    return _P5_INSTANCE.sin(*args)

def tan(*args):
    return _P5_INSTANCE.tan(*args)

def degrees(*args):
    return _P5_INSTANCE.degrees(*args)

def radians(*args):
    return _P5_INSTANCE.radians(*args)

def angle_mode(*args):
    return _P5_INSTANCE.angleMode(*args)

def text_align(*args):
    return _P5_INSTANCE.textAlign(*args)

def text_leading(*args):
    return _P5_INSTANCE.textLeading(*args)

def text_size(*args):
    return _P5_INSTANCE.textSize(*args)

def text_style(*args):
    return _P5_INSTANCE.textStyle(*args)

def text_width(*args):
    return _P5_INSTANCE.textWidth(*args)

def text_ascent(*args):
    return _P5_INSTANCE.textAscent(*args)

def text_descent(*args):
    return _P5_INSTANCE.textDescent(*args)

def load_font(*args):
    return _P5_INSTANCE.loadFont(*args)

def text(*args):
    return _P5_INSTANCE.text(*args)

def text_font(*args):
    return _P5_INSTANCE.textFont(*args)

def orbit_control(*args):
    return _P5_INSTANCE.orbitControl(*args)

def debug_mode(*args):
    return _P5_INSTANCE.debugMode(*args)

def no_debug_mode(*args):
    return _P5_INSTANCE.noDebugMode(*args)

def ambient_light(*args):
    return _P5_INSTANCE.ambientLight(*args)

def directional_light(*args):
    return _P5_INSTANCE.directionalLight(*args)

def point_light(*args):
    return _P5_INSTANCE.pointLight(*args)

def lights(*args):
    return _P5_INSTANCE.lights(*args)

def load_shader(*args):
    return _P5_INSTANCE.loadShader(*args)

def create_shader(*args):
    return _P5_INSTANCE.createShader(*args)

def shader(*args):
    return _P5_INSTANCE.shader(*args)

def reset_shader(*args):
    return _P5_INSTANCE.resetShader(*args)

def normal_material(*args):
    return _P5_INSTANCE.normalMaterial(*args)

def texture(*args):
    return _P5_INSTANCE.texture(*args)

def texture_mode(*args):
    return _P5_INSTANCE.textureMode(*args)

def texture_wrap(*args):
    return _P5_INSTANCE.textureWrap(*args)

def ambient_material(*args):
    return _P5_INSTANCE.ambientMaterial(*args)

def specular_material(*args):
    return _P5_INSTANCE.specularMaterial(*args)

def shininess(*args):
    return _P5_INSTANCE.shininess(*args)

def camera(*args):
    return _P5_INSTANCE.camera(*args)

def perspective(*args):
    return _P5_INSTANCE.perspective(*args)

def ortho(*args):
    return _P5_INSTANCE.ortho(*args)

def create_camera(*args):
    return _P5_INSTANCE.createCamera(*args)

def set_camera(*args):
    return _P5_INSTANCE.setCamera(*args)

def select(*args):
    return _P5_INSTANCE.select(*args)

def select_all(*args):
    return _P5_INSTANCE.selectAll(*args)

def remove_elements(*args):
    return _P5_INSTANCE.removeElements(*args)

def changed(*args):
    return _P5_INSTANCE.changed(*args)

def hex_color(color):
    if hasattr(color, 'toString'):
        return color.toString('#rrggbbaa')
    if isinstance(color, builtins.int):
        return "#%06X%02X" % (color & 0xFFFFFF, (color >> 24) & 0xFF)
    return _P5_INSTANCE.hex(color)

def input(*args):
    return _P5_INSTANCE.input(*args)

def createDiv(*args):
    return _P5_INSTANCE.createDiv(*args)

def createP(*args):
    return _P5_INSTANCE.createP(*args)

def createSpan(*args):
    return _P5_INSTANCE.createSpan(*args)

def createImg(*args):
    return _P5_INSTANCE.createImg(*args)

def createA(*args):
    return _P5_INSTANCE.createA(*args)

def createSlider(*args):
    return _P5_INSTANCE.createSlider(*args)

def createButton(*args):
    return _P5_INSTANCE.createButton(*args)

def createCheckbox(*args):
    return _P5_INSTANCE.createCheckbox(*args)

def createSelect(*args):
    return _P5_INSTANCE.createSelect(*args)

def createRadio(*args):
    return _P5_INSTANCE.createRadio(*args)

def createColorPicker(*args):
    return _P5_INSTANCE.createColorPicker(*args)

def createInput(*args):
    return _P5_INSTANCE.createInput(*args)

def createFileInput(*args):
    return _P5_INSTANCE.createFileInput(*args)

def createVideo(*args):
    return _P5_INSTANCE.createVideo(*args)

def createAudio(*args):
    return _P5_INSTANCE.createAudio(*args)

def createCapture(*args):
    return _P5_INSTANCE.createCapture(*args)

def createElement(*args):
    return _P5_INSTANCE.createElement(*args)

def createCanvas(*args):
    canvas = _P5_INSTANCE.createCanvas(*args)
    global width, height
    width = _P5_INSTANCE.width
    height = _P5_INSTANCE.height
    return canvas

def size(*args):
    canvas = createCanvas(*args)
    background(200) # py5 compatibility
    return canvas

def full_screen(*args):  # TODO: review
    """
    () -> None
    (display: int, /) -> None
    (renderer: str, /) -> None
    (renderer: str, display: int, /) -> None
    (display: int, renderer: str, /) -> None
    """
    display = None  # TODO: see how to use
    renderer = None
    for arg in args[:2]:
        if isinstance(arg, builtins.int) and display is None:
            display = arg
        elif isinstance(arg, builtins.str) and renderer is None:
            renderer = arg

    size(window.screen.width, window.screen.height, renderer)

def __deviceMoved(e):
    try:
        device_moved()
    except TypeError:
        device_moved(e)
    except NameError:
        pass

def __deviceTurned(e):
    try:
        device_turned()
    except TypeError:
        device_turned(e)
    except NameError:
        pass

def __deviceShaken(e):
    try:
        device_shaken()
    except TypeError:
        device_shaken(e)
    except NameError:
        pass

def __touchEnded(e):
    try:
        touch_ended()
    except TypeError:
        touch_ended(e)
    except NameError:
        pass

def __touchStarted(e):
    try:
        touch_started()
    except TypeError:
        touch_started(e)
    except NameError:
        pass

def __windowResized(e):
    try:
        window_resized()
    except TypeError:
        window_resized(e)
    except NameError:
        pass

def __touchMoved(e):
    try:
        touch_moved()
    except TypeError:
        touch_moved(e)
    except NameError:
        pass

def __mouseMoved(e):
    try:
        mouse_moved()
    except TypeError:
        mouse_moved(e)
    except NameError:
        pass

def __mouseDragged(e):
    try:
        mouse_dragged()
    except TypeError:
        mouse_dragged(e)
    except NameError:
            pass

def __mousePressed(e):
    try:
        mouse_pressed()
    except TypeError:
        mouse_pressed(e)
    except NameError:
        pass

def __mouseReleased(e):
    try:
        mouse_released()
    except TypeError:
        mouse_released(e)
    except NameError:
        pass

def __mouseClicked(e):
    try:
        mouse_clicked()
    except TypeError:
        mouse_clicked(e)
    except NameError:
        pass

def __doubleClicked(e):
    try:
        double_clicked()
    except TypeError:
        double_clicked(e)
    except NameError:
        pass

def __mouseWheel(e):
    try:
        mouse_wheel()
    except TypeError:
        e.get_count = lambda: e.delta // abs(e.delta)
        mouse_wheel(e)
    except NameError:
        pass

def __keyPressed(e):
    try:
        key_pressed()
    except TypeError:
        key_pressed(Py5KeyEvent(e))
    except NameError:
        pass

def __keyReleased(e):
    try:
        key_released()
    except TypeError:
        key_released(Py5KeyEvent(e))
    except NameError:
        pass

def __keyTyped(e):
    try:
        key_typed()
    except TypeError:
        key_typed(Py5KeyEvent(e))
    except NameError:
        pass

def __keyIsDown(e):
    try:
        key_is_down()
    except TypeError:
        key_is_down(Py5KeyEvent(e))
    except NameError:
        pass

def pop(*args):
    p5_pop = _P5_INSTANCE.pop(*args)
    return p5_pop

def createVector(*args):
    return _P5_INSTANCE.createVector(*args)

# more py5 mode compatibility aliases
pop_matrix = pop
pop_style = pop
push_matrix = push
push_style = push


class Py5Vector(Sequence):
    _DEFAULT_DIM = 3

    def __new__(cls, *args, dim: int = None, dtype: type = None, copy: bool = True):
        kwarg_dim = dim
        kwarg_dtype = dtype

        used_default_dim = len(args) == 0 and dim is None
        dim = Py5Vector._DEFAULT_DIM if dim is None else dim
        dtype = np.float64 if dtype is None else dtype

        if not isinstance(dtype, (type, np.dtype)) or not np.issubdtype(
            dtype, np.floating
        ):
            raise RuntimeError(
                "dtype parameter is not a valid numpy float type (i.e., np.float32, np.float64, etc)"
            )

        if copy == False:
            if not (
                len(args) == 1
                and isinstance(args[0], np.ndarray)
                and np.issubdtype(args[0].dtype, np.floating)
            ):
                raise RuntimeError(
                    "When the copy parameter is False, please provide a single properly sized numpy array with a floating dtype for py5 to store vector data"
                )
            if kwarg_dtype is not None and args[0].dtype != kwarg_dtype:
                raise RuntimeError(
                    "When the copy parameter is False, the dtype parameter cannot differ from the provided numpy array's dtype"
                )

        if len(args) == 0:
            data = np.zeros(dim, dtype=dtype)
        elif len(args) == 1 and isinstance(args[0], Iterable):
            arg0 = args[0]
            if not hasattr(arg0, "__len__"):
                arg0 = list(arg0)
            if 2 <= len(arg0) <= 4:
                if isinstance(arg0, Py5Vector):
                    arg0 = arg0._data
                if isinstance(arg0, np.ndarray):
                    if copy:
                        data = arg0.astype(dtype).flatten()
                    else:
                        data = arg0.flatten()
                else:
                    data = np.array(arg0, dtype=dtype).flatten()
            else:
                raise RuntimeError(f"Cannot create a Py5Vector with {len(arg0)} values")
        elif 2 <= len(args) <= 4:
            dtype_ = None or kwarg_dtype
            data_ = []
            for i, item in enumerate(args):
                if isinstance(item, (np.ndarray, Py5Vector)):
                    if np.issubdtype(item.dtype, np.floating) or np.issubdtype(
                        item.dtype, np.integer
                    ):
                        if kwarg_dtype is None:
                            dtype_ = (
                                item.dtype
                                if dtype_ is None
                                else max(dtype_, item.dtype)
                            )
                        data_.extend(
                            item.flatten().tolist()
                            if isinstance(item, np.ndarray)
                            else item.tolist()
                        )
                    else:
                        raise RuntimeError(
                            f"Argument {i} is a numpy array with dtype {item.dtype} and cannot be used in a Py5Vector"
                        )
                elif isinstance(item, Iterable):
                    data_.extend(item)
                elif isinstance(item, (builtins.int, builtins.float, np.integer, np.floating)):
                    data_.append(item)
                else:
                    raise RuntimeError(
                        f"Argument {i} has type {type(item).__name__} and cannot be used used in a Py5Vector"
                    )
            if 2 <= len(data_) <= 4:
                data = np.array(data_, dtype=dtype_ or dtype)
            else:
                raise RuntimeError(
                    f"Cannot create a Py5Vector with {len(data_)} values"
                )
        else:
            raise RuntimeError(f"Cannot create Py5Vector instance with {str(args)}")

        dim = len(data)
        dtype = data.dtype

        if kwarg_dim is not None and dim != kwarg_dim:
            raise RuntimeError(
                f"dim parameter is {kwarg_dim} but Py5Vector values imply dimension of {dim}"
            )
        if kwarg_dtype is not None and dtype != kwarg_dtype:
            raise RuntimeError(
                f"dtype parameter is {kwarg_dtype} but Py5Vector values imply dtype of {dtype}"
            )

        if dim == 2:
            v = object.__new__(Py5Vector2D)
        elif dim == 3:
            v = object.__new__(Py5Vector3D)
        elif dim == 4:
            v = object.__new__(Py5Vector4D)
        else:
            raise RuntimeError(f"Why is dim == {dim}? Please report bug")

        v._data = data
        v._used_default_dim = used_default_dim

        return v

    def __getattr__(self, name):
        if hasattr(self, "_data") and not (set(name) - set("xyzw"[: self._data.size])):
            if 2 <= len(name) <= 4:
                return Py5Vector(
                    self._data[["xyzw".index(c) for c in name]],
                    dtype=self._data.dtype,
                    copy=True,
                )
            else:
                raise RuntimeError(
                    "Invalid swizzle: length must be between 2 and 4 characters"
                )
        else:
            raise AttributeError(error_msg("Py5Vector", name, self))

    def __setattr__(self, name, val):
        if name.startswith("_") or not (
            hasattr(self, "_data") and not (set(name) - set("xyzw"[: self._data.size]))
        ):
            super().__setattr__(name, val)
        elif len(name) == len(set(name)):
            if not isinstance(val, Iterable) or len(val) in [1, len(name)]:
                self._data[["xyzw".index(c) for c in name]] = val
            else:
                raise RuntimeError(
                    f"Mismatch: value length of {len(val)} cannot be assigned to swizzle of length {len(name)}"
                )
        else:
            raise RuntimeError(
                "Invalid swizzle: repeats are not allowed in assignments"
            )

    def __getitem__(self, key):
        return self._data[key]

    def __setitem__(self, key, val):
        self._data[key] = val

    def __len__(self):
        return self._data.size

    def __iter__(self):
        return self._data.__iter__()

    def __str__(self):
        vals = ", ".join(re.split(r"\s+", str(self._data)[1:-1].strip()))
        return f"Py5Vector{self._data.size}D({vals})"

    def __repr__(self):
        return f"Py5Vector{self._data.size}D{repr(self._data)[5:]}"

    def _check_used_default_dim(self, other):
        if self._used_default_dim or (
            isinstance(other, Py5Vector) and other._used_default_dim
        ):
            other_dim = self._data.size + other._data.size - Py5Vector._DEFAULT_DIM
            return f" Note that one of the Py5Vectors was created with Py5Vector(), and is therefore by default a {Py5Vector._DEFAULT_DIM}D vector. If you wanted a {other_dim}D vector instead, use the 'dim' parameter, like this: Py5Vector(dim={other_dim})."
        else:
            return ""

    def _run_op(
        self, op, other, opname, swap=False, inplace=False, allow2vectors=False
    ):
        if isinstance(other, Py5Vector):
            if not allow2vectors:
                raise RuntimeError(
                    f"Cannot perform {opname} operation on two Py5Vectors. If you want to do {opname} on the Py5Vector's data elementwise, use the '.data' attribute to access the Py5Vector's data as a numpy array."
                )
            elif self._data.size != other._data.size:
                raise RuntimeError(
                    f"Cannot perform {opname} operation on a {self._data.size}D Py5Vector and a {other._data.size}D Py5Vector. The dimensions must be the same."
                    + self._check_used_default_dim(other)
                )
            elif inplace:
                op(self._data[: other._data.size], other._data[: other._data.size])
                return self
            else:
                a, b = (other, self) if swap else (self, other)
                return Py5Vector(op(a._data, b._data), dim=a._data.size, copy=False)
        else:
            try:
                if inplace:
                    op(self._data, other)
                    return self
                else:
                    a, b = (other, self._data) if swap else (self._data, other)
                    result = op(a, b)
                    return (
                        Py5Vector(result, copy=False)
                        if result.ndim == 1 and 2 <= result.size <= 4
                        else result
                    )
            except ValueError as e:
                other_type = (
                    "numpy array"
                    if isinstance(other, np.ndarray)
                    else f"{type(other).__name__} object"
                )
                raise RuntimeError(
                    f"Unable to perform {opname} on a Py5Vector and a {other_type}, probably because of a size mismatch. The error message is: "
                    + str(e)
                ) from None

    def __add__(self, other):
        return self._run_op(operator.add, other, "addition", allow2vectors=True)

    def __iadd__(self, other):
        return self._run_op(
            operator.iadd, other, "addition", inplace=True, allow2vectors=True
        )

    def __radd__(self, other):
        return self._run_op(
            operator.add, other, "addition", swap=True, allow2vectors=True
        )

    def __sub__(self, other):
        return self._run_op(operator.sub, other, "subtraction", allow2vectors=True)

    def __isub__(self, other):
        return self._run_op(
            operator.isub, other, "subtraction", inplace=True, allow2vectors=True
        )

    def __rsub__(self, other):
        return self._run_op(
            operator.sub, other, "subtraction", swap=True, allow2vectors=True
        )

    def __mul__(self, other):
        return self._run_op(operator.mul, other, "multiplication")

    def __imul__(self, other):
        return self._run_op(operator.imul, other, "multiplication", inplace=True)

    def __rmul__(self, other):
        return self._run_op(operator.mul, other, "multiplication", swap=True)

    def __truediv__(self, other):
        return self._run_op(operator.truediv, other, "division")

    def __itruediv__(self, other):
        return self._run_op(operator.itruediv, other, "division", inplace=True)

    def __rtruediv__(self, other):
        return self._run_op(operator.truediv, other, "division", swap=True)

    def __floordiv__(self, other):
        return self._run_op(operator.floordiv, other, "integer division")

    def __ifloordiv__(self, other):
        return self._run_op(operator.ifloordiv, other, "integer division", inplace=True)

    def __rfloordiv__(self, other):
        return self._run_op(operator.floordiv, other, "integer division", swap=True)

    def __mod__(self, other):
        return self._run_op(operator.mod, other, "modular division")

    def __imod__(self, other):
        return self._run_op(operator.imod, other, "modular division", inplace=True)

    def __rmod__(self, other):
        return self._run_op(operator.mod, other, "modular division", swap=True)

    def __divmod__(self, other):
        return self._run_op(operator.floordiv, other, "integer division"), self._run_op(
            operator.mod, other, "modular division"
        )

    def __rdivmod__(self, other):
        return self._run_op(
            operator.floordiv, other, "integer division", swap=True
        ), self._run_op(operator.mod, other, "modular division", swap=True)

    def __pow__(self, other):
        return self._run_op(operator.pow, other, "power")

    def __ipow__(self, other):
        return self._run_op(operator.ipow, other, "power", inplace=True)

    def __matmul__(self, other):
        return self._run_op(operator.matmul, other, "matrix multiplication")

    def __rmatmul__(self, other):
        return self._run_op(operator.matmul, other, "matrix multiplication", swap=True)

    def __imatmul__(self, other):
        return self._run_op(operator.imatmul, other, "matrix multiplication")

    def __pos__(self):
        return self

    def __neg__(self):
        return Py5Vector(-self._data, copy=False)

    def __abs__(self):
        return Py5Vector(np.abs(self._data), copy=False)

    def __round__(self):
        return Py5Vector(np.round(self._data), copy=False)

    def __bool__(self):
        return any(self._data != 0.0)

    def __eq__(self, other):
        return isinstance(other, type(self)) and all(self._data == other._data)

    def __ne__(self, other):
        return not isinstance(other, type(self)) or any(self._data != other._data)

    def astype(self, dtype):
        return Py5Vector(self._data, dtype=dtype, copy=True)

    def tolist(self):
        return self._data.tolist()

    def _get_x(self):
        return self._data[0]

    def _set_x(self, val):
        self._data[0] = val

    def _get_y(self):
        return self._data[1]

    def _set_y(self, val):
        self._data[1] = val

    def _get_data(self):
        return self._data

    def _get_copy(self):
        return Py5Vector(self._data, dtype=self._data.dtype, copy=True)

    def _get_dim(self):
        return self._data.size

    def _get_dtype(self):
        return self._data.dtype

    x = property(_get_x, _set_x)
    y = property(_get_y, _set_y)
    data = property(_get_data)
    copy = property(_get_copy)
    dim = property(_get_dim)
    dtype = property(_get_dtype)

    def _run_calc(self, other, calc, name, maybe_vector=False):
        other_type = (
            "numpy array"
            if isinstance(other, np.ndarray)
            else f"{type(other).__name__} object"
        )
        if isinstance(other, Py5Vector):
            if self._data.size == other._data.size:
                other = other._data
            else:
                raise RuntimeError(
                    f"Py5Vector dimensions must be the same to calculate the {name} two Py5Vectors."
                    + self._check_used_default_dim(other)
                )

        if isinstance(other, np.ndarray):
            try:
                result = calc(self._data, other)
                if result.ndim == 0:
                    return float(result)
                if maybe_vector and result.ndim == 1 and 2 <= result.size <= 4:
                    return Py5Vector(result, copy=False)
                else:
                    return result
            except ValueError as e:
                raise RuntimeError(
                    f"Unable to calculate the {name} between a Py5Vector and {other_type}, probably because of a size mismatch. The error message is: "
                    + str(e)
                ) from None
        else:
            raise RuntimeError(
                f"Do not know how to calculate the {name} {type(self).__name__} and {type(other).__name__}"
            )

    def lerp(self, other, amt):
        return self._run_calc(
            other, lambda s, o: s + (o - s) * amt, "lerp of", maybe_vector=True
        )

    def dist(self, other):
        return self._run_calc(
            other,
            lambda s, o: np.sqrt(np.sum((s - o) ** 2, axis=-1)),
            "distance between",
        )

    def dot(self, other):
        return self._run_calc(
            other, lambda s, o: (s * o).sum(axis=-1), "dot product for"
        )

    def angle_between(self, other):
        return self._run_calc(
            other,
            lambda s, o: np.arccos(
                (
                    (s / np.sum(s ** 2) ** 0.5)
                    * (o / np.sum(o ** 2, axis=-1, keepdims=o.ndim) ** 0.5)
                ).sum(axis=-1)
            ),
            "angle between",
        )

    def cross(self, other):
        if self._data.size == 4 or isinstance(other, Py5Vector4D):
            raise RuntimeError("Cannot calculate the cross product with a 4D Py5Vector")
        elif self._data.size == 2:
            maybe_vector = isinstance(other, Py5Vector3D)
            if isinstance(other, Py5Vector):
                other = other._data
            return self._run_calc(
                other, np.cross, "cross product of", maybe_vector=maybe_vector
            )
        else:  # self._data.size == 3:
            if isinstance(other, Py5Vector):
                other = other._data
            return self._run_calc(
                other, np.cross, "cross product of", maybe_vector=True
            )

    def _get_mag(self):
        return float(np.sum(self._data ** 2) ** 0.5)

    def set_mag(self, mag: float):
        if mag == 0:
            self._data[:] = 0
        else:
            self.normalize()
            self._data *= mag

        return self

    def _get_mag_sq(self):
        return float(np.sum(self._data ** 2))

    def set_mag_sq(self, mag_sq):
        if mag_sq < 0:
            raise RuntimeError("Cannot set squared magnitude to a negative number")
        elif mag_sq == 0:
            self._data[:] = 0
        else:
            self.normalize()
            self._data *= mag_sq ** 0.5
        return self

    def normalize(self):
        mag = np.sum(self._data ** 2) ** 0.5
        if mag > 0:
            self._data /= mag
            return self
        else:
            warnings.warn(
                "Using normalize on a zero vector has no effect", stacklevel=2
            )

    def _get_norm(self):
        return self.copy.normalize()

    mag = property(_get_mag, set_mag)
    mag_sq = property(_get_mag_sq, set_mag_sq)
    norm = property(_get_norm)

    def set_limit(self, max_mag):
        if max_mag < 0:
            raise RuntimeError("Cannot set limit to a negative number")
        elif max_mag == 0:
            self._data[:] = 0
        else:
            mag_sq = np.sum(self._data ** 2)
            if mag_sq > max_mag * max_mag:
                self._data *= max_mag / (mag_sq ** 0.5)
        return self

    def _get_heading(self):
        if self._data.size == 2:
            return float(np.arctan2(self._data[1], self._data[0]))
        elif self._data.size == 3:
            return (
                float(np.arctan2((self._data[:2] ** 2).sum() ** 0.5, self._data[2])),
                float(np.arctan2(self._data[1], self._data[0])),
            )
        else:
            return (
                float(np.arctan2((self._data[1:] ** 2).sum() ** 0.5, self._data[0])),
                float(np.arctan2((self._data[2:] ** 2).sum() ** 0.5, self._data[1])),
                float(
                    2
                    * np.arctan2(
                        self._data[3],
                        self._data[2] + (self._data[2:] ** 2).sum() ** 0.5,
                    )
                ),
            )

    def set_heading(self, *heading):
        if len(heading) == 1 and isinstance(heading[0], Iterable):
            heading = heading[0]

        mag = self._get_mag()
        if len(heading) == 1 and self._data.size == 2:
            theta = heading[0]
            x = mag * np.cos(theta)
            y = mag * np.sin(theta)
            self._data[:] = [x, y]
            return self
        elif len(heading) == 2 and self._data.size == 3:
            theta, phi = heading
            sin_theta = np.sin(theta)
            x = mag * np.cos(phi) * sin_theta
            y = mag * np.sin(phi) * sin_theta
            z = mag * np.cos(theta)
            self._data[:] = [x, y, z]
            return self
        elif len(heading) == 3 and self._data.size == 4:
            phi1, phi2, phi3 = heading
            sin_phi1 = np.sin(phi1)
            sin_phi2 = np.sin(phi2)
            x1 = mag * np.cos(phi1)
            x2 = mag * sin_phi1 * np.cos(phi2)
            x3 = mag * sin_phi1 * sin_phi2 * np.cos(phi3)
            x4 = mag * sin_phi1 * sin_phi2 * np.sin(phi3)
            self._data[:] = [x1, x2, x3, x4]
            return self
        else:
            raise RuntimeError(
                f"This Py5Vector has dimension {self._data.size} and requires {self._data.size - 1} values to set the heading, not {len(heading)}"
            )

    heading = property(_get_heading, set_heading)

    @classmethod
    def from_heading(cls, *heading, dtype=np.float64):
        if len(heading) == 1 and isinstance(heading[0], Iterable):
            heading = heading[0]

        if len(heading) == 1:
            return Py5Vector(1, 0, dtype=dtype).set_heading(*heading)
        elif len(heading) == 2:
            return Py5Vector(1, 0, 0, dtype=dtype).set_heading(*heading)
        elif len(heading) == 3:
            return Py5Vector(1, 0, 0, 0, dtype=dtype).set_heading(*heading)
        else:
            raise RuntimeError(
                f"Cannot create a Py5Vector from {len(heading)} arguments"
            )

    @classmethod
    def random(cls, dim, *, dtype=np.float64):
        if dim == 2:
            return Py5Vector(
                np.cos(angle := np.random.rand() * 2 * np.pi),
                np.sin(angle),
                dtype=dtype,
            )
        elif dim == 3:
            return Py5Vector(
                (v := np.random.randn(3).astype(dtype)) / (v ** 2).sum() ** 0.5,
                copy=False,
            )
        elif dim == 4:
            return Py5Vector(
                (v := np.random.randn(4).astype(dtype)) / (v ** 2).sum() ** 0.5,
                copy=False,
            )
        else:
            raise RuntimeError(f"Cannot create a random Py5Vector with dimension {dim}")

class Py5Vector2D(Py5Vector):
    def __new__(cls, *args, dtype=np.float64):
        return super().__new__(cls, *args, dim=2, dtype=dtype)

    def rotate(self, angle):
        sin_angle = np.sin(angle)
        cos_angle = np.cos(angle)
        rot = np.array([[cos_angle, -sin_angle], [sin_angle, cos_angle]])
        self._data[:] = rot @ self._data
        return self

    @classmethod
    def random(cls, dim=2, *, dtype=np.float64):
        return super().random(dim, dtype=dtype)


class Py5Vector3D(Py5Vector):
    def __new__(cls, *args, dtype=np.float64):
        return super().__new__(cls, *args, dim=3, dtype=dtype)

    def _get_z(self):
        return self._data[2]

    def _set_z(self, val):
        self._data[2] = val

    z = property(_get_z, _set_z)

    def rotate(self, angle, dim):
        sin_angle = np.sin(angle)
        cos_angle = np.cos(angle)
        if dim in [1, "x"]:
            rot = np.array(
                [[1, 0, 0], [0, cos_angle, -sin_angle], [0, sin_angle, cos_angle]]
            )
        elif dim in [2, "y"]:
            rot = np.array(
                [[cos_angle, 0, sin_angle], [0, 1, 0], [-sin_angle, 0, cos_angle]]
            )
        elif dim in [3, "z"]:
            rot = np.array(
                [[cos_angle, -sin_angle, 0], [sin_angle, cos_angle, 0], [0, 0, 1]]
            )
        else:
            raise RuntimeError(
                "dim parameter must be 1, 2, or 3, or one of 'x', 'y', and 'z'"
            )
        self._data[:] = rot @ self._data
        return self

    def rotate_around(self, angle, v):
        if not isinstance(v, Py5Vector3D):
            raise RuntimeError("Can only rotate around another 3D Py5Vector")
        if not v:
            raise RuntimeError("Cannot rotate around a vector of zeros")
        u = v.norm
        ux, uy, uz = u.x, u.y, u.z
        sin, cos = np.sin(angle), np.cos(angle)
        ncosp1 = 1 - cos
        rot = np.array(
            [
                [
                    cos + ux * ux * ncosp1,
                    ux * uy * ncosp1 - uz * sin,
                    ux * uz * ncosp1 + uy * sin,
                ],
                [
                    uy * ux * ncosp1 + uz * sin,
                    cos + uy * uy * ncosp1,
                    uy * uz * ncosp1 - ux * sin,
                ],
                [
                    uz * ux * ncosp1 - uy * sin,
                    uz * uy * ncosp1 + ux * sin,
                    cos + uz * uz * ncosp1,
                ],
            ]
        )
        self._data[:] = rot @ self._data
        return self

    @classmethod
    def random(cls, dim=3, *, dtype=np.float64):
        return super().random(dim, dtype=dtype)


class Py5Vector4D(Py5Vector):
    def __new__(cls, *args, dtype=np.float64):
        return super().__new__(cls, *args, dim=4, dtype=dtype)

    def _get_z(self):
        return self._data[2]

    def _set_z(self, val):
        self._data[2] = val

    def _get_w(self):
        return self._data[3]

    def _set_w(self, val):
        self._data[3] = val

    z = property(_get_z, _set_z)
    w = property(_get_w, _set_w)

    @classmethod
    def random(cls, dim=4, *, dtype=np.float64):
        return super().random(dim, dtype=dtype)


def error_msg(obj_name, word, obj, module=False):
    msg = (
        "py5 has no field or function"
        if module
        else obj_name + " objects have no fields or methods"
    )
    msg += ' named "' + word + '"'

    if (
        word
        and word[0] != "_"
        and (suggestion_list := suggestions(word, set(dir(obj))))
    ):
        msg += ". Did you mean " + suggestion_list + "?"

    return msg


class Modifier(builtins.int):
    def __init__(self, x):
        self._x = x

    def __and__(self, o):
        return self._x == o


class Py5KeyEvent:
    _py5_object_cache = weakref.WeakSet()

    def __new__(cls, pkeyevent):
        for o in cls._py5_object_cache:
            if pkeyevent == o._instance:
                return o
        else:
            o = object.__new__(Py5KeyEvent)
            o._instance = pkeyevent
            cls._py5_object_cache.add(o)
            return o

    def __repr__(self):
        key = self.get_key()
        action = self.get_action()

        action_str = "UNKNOWN"
        for k, v in Py5KeyEvent.__dict__.items():
            if k == k.upper() and action == v:
                action_str = k
                break

        if key == "\uffff":  # py5.CODED
            key = "CODED"

        return f"Py5KeyEvent(key=" + key + ", action=" + action_str + ")"

    def __getattr__(self, name):
        raise AttributeError(error_msg("Py5KeyEvent", name, self))

    ALT = 18
    CTRL = 17
    SHIFT = 16

    META = 4
    PRESS = 1
    RELEASE = 2
    TYPE = 3

    def get_action(self):
        return self._instance.key

    def get_key(self):
        return self._instance.key

    def get_key_code(self):
        return self._instance.keyCode

    def get_millis(self):
        return self._instance.timeStamp

    def get_modifiers(self):
        return Modifier(self._instance.keyCode)

    def get_native(self):
        return self._instance.getNative()

    def is_alt_down(self):
        return self._instance.altKey

    def is_auto_repeat(self):
        return self._instance.isAutoRepeat()

    def is_control_down(self):
        return self._instance.ctrlKey

    def is_meta_down(self):
        return self._instance.metaKey

    def is_shift_down(self):
        return self._instance.shiftKey


def pre_draw(p5_instance, draw_func, *args, **kwargs):
    """
    We need to run this before the actual draw to insert and update p5 env variables
    """
    global _CTX_MIDDLE, _DEFAULT_FILL, _DEFAULT_LEADMULT, _DEFAULT_STROKE, _DEFAULT_TEXT_FILL

    global ADD, ALT, ARROW, AUTO, AUDIO, AXES, BACKSPACE, BASELINE, BEVEL, BEZIER, BLEND, BLUR, BOLD, BOLDITALIC
    global BOTTOM, BURN, CENTER, CHORD, CLAMP, CLOSE, CONTROL, CORNER, CORNERS, CROSS, CURVE, DARKEST
    global DEG_TO_RAD, DEGREES, DELETE, DIFFERENCE, DILATE, DODGE, DOWN_ARROW, ENTER, ERODE, ESCAPE, EXCLUSION
    global FILL, GRAY, GRID, HALF_PI, HAND, HARD_LIGHT, HSB, HSL, IMAGE, IMMEDIATE, INVERT, ITALIC, LANDSCAPE
    global LEFT, LEFT_ARROW, LIGHTEST, LINE_LOOP, LINE_STRIP, LINEAR, LINES, MIRROR, MITER, MOVE, MULTIPLY, NEAREST
    global NORMAL, OPAQUE, OPEN, OPTION, OVERLAY, P2D, P3D, PI, PIE, POINTS, PORTRAIT, POSTERIZE, PROJECT, QUAD_STRIP
    global QUADRATIC, QUADS, QUARTER_PI, RAD_TO_DEG, RADIANS, RADIUS, REPEAT, REPLACE, RETURN, RGB, RIGHT, RIGHT_ARROW
    global ROUND, SCREEN, SHIFT, SOFT_LIGHT, SQUARE, STROKE, SUBTRACT, TAB, TAU, TEXT, TEXTURE, THRESHOLD, TOP
    global TRIANGLE_FAN, TRIANGLE_STRIP, TRIANGLES, TWO_PI, UP_ARROW, VIDEO, WAIT, WEBGL

    global frame_count, focused, display_width, display_height, window_width, window_height, width, height
    global device_orientation, acceleration_x, acceleration_y, acceleration_z
    global p_acceleration_x, p_acceleration_y, p_acceleration_z, rotation_x, rotation_y, rotation_z
    global p_rotation_x, p_rotation_y, p_rotation_z, turn_axis, is_key_pressed, key, key_code, mouse_x, mouse_y, pmouse_x, pmouse_y
    global win_mouse_x, win_mouse_y, pwin_mouse_x, pwin_mouse_y, mouse_button, is_mouse_pressed, touches, pixels

    _CTX_MIDDLE = p5_instance._CTX_MIDDLE
    _DEFAULT_FILL = p5_instance._DEFAULT_FILL
    _DEFAULT_LEADMULT = p5_instance._DEFAULT_LEADMULT
    _DEFAULT_STROKE = p5_instance._DEFAULT_STROKE
    _DEFAULT_TEXT_FILL = p5_instance._DEFAULT_TEXT_FILL

    ADD = p5_instance.ADD
    ALT = p5_instance.ALT
    ARROW = p5_instance.ARROW
    AUDIO = p5_instance.AUDIO
    AUTO = p5_instance.AUTO
    AXES = p5_instance.AXES
    BACKSPACE = p5_instance.BACKSPACE
    BASELINE = p5_instance.BASELINE
    BEVEL = p5_instance.BEVEL
    BEZIER = p5_instance.BEZIER
    BLEND = p5_instance.BLEND
    BLUR = p5_instance.BLUR
    BOLD = p5_instance.BOLD
    BOLDITALIC = p5_instance.BOLDITALIC
    BOTTOM = p5_instance.BOTTOM
    BURN = p5_instance.BURN
    CENTER = p5_instance.CENTER
    CHORD = p5_instance.CHORD
    CLAMP = p5_instance.CLAMP
    CLOSE = p5_instance.CLOSE
    CONTROL = p5_instance.CONTROL
    CORNER = p5_instance.CORNER
    CORNERS = p5_instance.CORNERS
    CROSS = p5_instance.CROSS
    CURVE = p5_instance.CURVE
    DARKEST = p5_instance.DARKEST
    DEG_TO_RAD = p5_instance.DEG_TO_RAD
    DEGREES = p5_instance.DEGREES
    DELETE = p5_instance.DELETE
    DIFFERENCE = p5_instance.DIFFERENCE
    DILATE = p5_instance.DILATE
    DODGE = p5_instance.DODGE
    DOWN_ARROW = p5_instance.DOWN_ARROW
    ENTER = p5_instance.ENTER
    ERODE = p5_instance.ERODE
    ESCAPE = p5_instance.ESCAPE
    EXCLUSION = p5_instance.EXCLUSION
    FILL = p5_instance.FILL
    GRAY = p5_instance.GRAY
    GRID = p5_instance.GRID
    HALF_PI = p5_instance.HALF_PI
    HAND = p5_instance.HAND
    HARD_LIGHT = p5_instance.HARD_LIGHT
    HSB = p5_instance.HSB
    HSL = p5_instance.HSL
    IMAGE = p5_instance.IMAGE
    IMMEDIATE = p5_instance.IMMEDIATE
    INVERT = p5_instance.INVERT
    ITALIC = p5_instance.ITALIC
    LANDSCAPE = p5_instance.LANDSCAPE
    LEFT = p5_instance.LEFT
    LEFT_ARROW = p5_instance.LEFT_ARROW
    LIGHTEST = p5_instance.LIGHTEST
    LINE_LOOP = p5_instance.LINE_LOOP
    LINE_STRIP = p5_instance.LINE_STRIP
    LINEAR = p5_instance.LINEAR
    LINES = p5_instance.LINES
    MIRROR = p5_instance.MIRROR
    MITER = p5_instance.MITER
    MOVE = p5_instance.MOVE
    MULTIPLY = p5_instance.MULTIPLY
    NEAREST = p5_instance.NEAREST
    NORMAL = p5_instance.NORMAL
    OPAQUE = p5_instance.OPAQUE
    OPEN = p5_instance.OPEN
    OPTION = p5_instance.OPTION
    OVERLAY = p5_instance.OVERLAY
    P2D = p5_instance.P2D
    P3D = p5_instance.WEBGL
    PI = p5_instance.PI
    PIE = p5_instance.PIE
    POINTS = p5_instance.POINTS
    PORTRAIT = p5_instance.PORTRAIT
    POSTERIZE = p5_instance.POSTERIZE
    PROJECT = p5_instance.PROJECT
    QUAD_STRIP = p5_instance.QUAD_STRIP
    QUADRATIC = p5_instance.QUADRATIC
    QUADS = p5_instance.QUADS
    QUARTER_PI = p5_instance.QUARTER_PI
    RAD_TO_DEG = p5_instance.RAD_TO_DEG
    RADIANS = p5_instance.RADIANS
    RADIUS = p5_instance.RADIUS
    REPEAT = p5_instance.REPEAT
    REPLACE = p5_instance.REPLACE
    RETURN = p5_instance.RETURN
    RGB = p5_instance.RGB
    RIGHT = p5_instance.RIGHT
    RIGHT_ARROW = p5_instance.RIGHT_ARROW
    ROUND = p5_instance.ROUND
    SCREEN = p5_instance.SCREEN
    SHIFT = p5_instance.SHIFT
    SOFT_LIGHT = p5_instance.SOFT_LIGHT
    SQUARE = p5_instance.SQUARE
    STROKE = p5_instance.STROKE
    SUBTRACT = p5_instance.SUBTRACT
    TAB = p5_instance.TAB
    TAU = p5_instance.TAU
    TEXT = p5_instance.TEXT
    TEXTURE = p5_instance.TEXTURE
    THRESHOLD = p5_instance.THRESHOLD
    TOP = p5_instance.TOP
    TRIANGLE_FAN = p5_instance.TRIANGLE_FAN
    TRIANGLE_STRIP = p5_instance.TRIANGLE_STRIP
    TRIANGLES = p5_instance.TRIANGLES
    TWO_PI = p5_instance.TWO_PI
    UP_ARROW = p5_instance.UP_ARROW
    VIDEO = p5_instance.VIDEO
    WAIT = p5_instance.WAIT
    WEBGL = p5_instance.WEBGL

    frame_count = p5_instance.frameCount
    focused = p5_instance.focused
    display_width = p5_instance.displayWidth
    display_height = p5_instance.displayHeight
    window_width = p5_instance.windowWidth
    window_height = p5_instance.windowHeight
    width = p5_instance.width
    height = p5_instance.height
    device_orientation = p5_instance.deviceOrientation
    acceleration_x = p5_instance.accelerationX
    acceleration_y = p5_instance.accelerationY
    acceleration_z = p5_instance.accelerationZ
    pAcceleration_x = p5_instance.pAccelerationX
    pAcceleration_y = p5_instance.pAccelerationY
    pAcceleration_z = p5_instance.pAccelerationZ
    rotation_x = p5_instance.rotationX
    rotation_y = p5_instance.rotationY
    rotation_z = p5_instance.rotationZ
    pRotation_x = p5_instance.pRotationX
    pRotation_y = p5_instance.pRotationY
    pRotation_z = p5_instance.pRotationZ
    turn_axis = p5_instance.turnAxis
    is_key_pressed = p5_instance.keyIsPressed
    key = p5_instance.key
    key_code = p5_instance.keyCode
    mouse_x = p5_instance.mouseX
    mouse_y = p5_instance.mouseY
    pmouse_x = p5_instance.pmouseX
    pmouse_y = p5_instance.pmouseY
    win_mouse_x = p5_instance.winMouseX
    win_mouse_y = p5_instance.winMouseY
    pwin_mouse_x = p5_instance.pwinMouseX
    pwin_mouse_y = p5_instance.pwinMouseY
    mouse_button = p5_instance.mouseButton
    is_mouse_pressed = p5_instance.mouseIsPressed
    touches = p5_instance.touches
    pixels = p5_instance.pixels

    return draw_func(*args, **kwargs)


def global_p5_injection(p5_sketch):
    """
    Injects the p5js's skecth instance as a global variable to setup and draw functions
    """

    def decorator(f):
        def wrapper(*args, **kwargs):
            global _P5_INSTANCE
            _P5_INSTANCE = p5_sketch
            return pre_draw(_P5_INSTANCE, f, *args, **kwargs)

        return wrapper

    return decorator


def start_p5(preload_func, setup_func, draw_func, event_functions):
    """
    This is the entrypoint function. It accepts 2 parameters:

    - preload_func: A Python preload callable
    - setup_func: a Python setup callable
    - draw_func: a Python draw callable
    - event_functions: a config dict for the event functions in the format:
                       {"eventFunctionName": python_event_function}

    This method gets the p5js's sketch instance and injects them
    """

    def sketch_setup(p5_sketch):
        """
        Callback function called to configure new p5 instance
        """
        p5_sketch.preload = global_p5_injection(p5_sketch)(preload_func)
        p5_sketch.setup = global_p5_injection(p5_sketch)(setup_func)
        p5_sketch.draw = global_p5_injection(p5_sketch)(draw_func)

    window._p5_instance = p5.new(sketch_setup)

    # Register event functions
    event_function_names = (
        "deviceMoved", "deviceTurned", "deviceShaken", "windowResized",
        "keyPressed", "keyReleased", "keyTyped",
        "mousePressed", "mouseReleased", "mouseClicked", "doubleClicked",
        "mouseMoved", "mouseDragged", "mouseWheel",
        "touchStarted", "touchMoved", "touchEnded", "keyIsDown",
    )
    for f_name in [f for f in event_function_names if event_functions.get(f, None)]:
        func = event_functions[f_name]
        event_func = global_p5_injection(window._p5_instance)(func)
        setattr(window._p5_instance, f_name, event_func)
`; // end of const wrapperContent

const placeholder = `
def preload():
    pass

def setup():
    pass

def draw():
    pass
`;

const startCode = `
event_functions = {
    "deviceMoved": __deviceMoved,
    "deviceTurned": __deviceTurned,
    "deviceShaken": __deviceShaken,
    "keyPressed": __keyPressed,
    "keyReleased": __keyReleased,
    "keyTyped": __keyTyped,
    "mouseMoved": __mouseMoved,
    "mouseDragged": __mouseDragged,
    "mousePressed": __mousePressed,
    "mouseReleased": __mouseReleased,
    "mouseClicked": __mouseClicked,
    "doubleClicked": __doubleClicked,
    "mouseWheel": __mouseWheel,
    "touchStarted": __touchStarted,
    "touchMoved": __touchMoved,
    "touchEnded": __touchEnded,
    "windowResized": __windowResized,
}

start_p5(preload, setup, draw, event_functions)
`;

// TODO: separate text above into another file

declare var loadPyodide: any;
declare global {
  interface Window {
    _p5_instance: any;
  }
}

type ErrorHandler = (err: string) => void;

export class Py5Wrapper {
  initialized: boolean = false;

  protected _canvas: HTMLCanvasElement;
  protected _pyodide: any;
  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;

  constructor({
    canvas,
    onError,
    onWarning,
  }: {
    canvas: HTMLCanvasElement;
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
  }) {
    this._canvas = canvas;
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
  }

  async initialize() {
    if (this.initialized) return;

    this._pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
      packages: ["micropip", "numpy", "requests", "pyodide-http"],
    });

    await this._pyodide.runPythonAsync(`
      import io, code, sys, pyodide_http
      from js import p5, window, document

      pyodide_http.patch_all()
      print(sys.version)
    `);

    this.initialized = true;
    this._onWarning("Py5 initialized");
    await this.tryEval("");
  }

  async tryEval(userCode: string) {
    if (!this.initialized) {
      this._onWarning("Engine still loading");
      this.initialize();
      return;
    }

    if (window._p5_instance) {
      window._p5_instance.remove();
    }

    try {
      let code = [placeholder, userCode, wrapperContent, startCode].join("\n");
      console.log("Python execution output:");
      await this._pyodide.runPythonAsync(code);
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
    }
  }
}

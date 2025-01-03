const wrapperContent = `
# This pyp5js version is adapted to be more similar to py5 (py5coding.org)
# by Alexandre B A Villares - https://abav.lugaralgum.com

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

def end_contour(*args):
    return _P5_INSTANCE.endContour(*args)

def end_shape(*args):
    return _P5_INSTANCE.endShape(*args)

def quadratic_vertex(*args):
    return _P5_INSTANCE.quadraticVertex(*args)

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

def load_json(*args):
    return _P5_INSTANCE.loadJSON(*args)

def load_strings(*args):
    return _P5_INSTANCE.loadStrings(*args)

def load_table(*args):
    return _P5_INSTANCE.loadTable(*args)

def loadXML(*args):
    return _P5_INSTANCE.loadXML(*args)

def load_bytes(*args):
    return _P5_INSTANCE.loadBytes(*args)

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

println = print


import builtins
import types
from random import randint

import numpy as np

np_random = np.random.default_rng()

def random_seed(seed):
    global np_random
    np_random = np.random.default_rng(seed)

def random(*args):
    if len(args) == 0:
        return np_random.uniform()
    elif len(args) == 1:
        high = args[0]
        if isinstance(high, (builtins.int, np.integer, float)):
            return np_random.uniform(0, high)
    elif len(args) == 2:
        low, high = args
        if isinstance(low, (builtins.int, np.integer, float)) and isinstance(
            high, (builtins.int, np.integer, float)
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
        if isinstance(loc, (builtins.int, np.integer, float)) and isinstance(
            scale, (builtins.int, np.integer, float)
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
        key_pressed(e)
    except NameError:
        pass

def __keyReleased(e):
    try:
        key_released()
    except TypeError:
        key_released(e)
    except NameError:
        pass

def __keyTyped(e):
    try:
        key_typed()
    except TypeError:
        key_typed(e)
    except NameError:
        pass

def __keyIsDown(e):
    try:
        key_is_down()
    except TypeError:
        key_is_down(e)
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

# Py5Vector is a wrapper/helper class for p5.Vector objets
# providing names similar to Processing Python or Java modes
# but mostly keeping p5js functionality TODO: review for py5

from numbers import Number

class Py5Vector:

    def __init__(self, x=0, y=0, z=0):
        self.__vector = createVector(x, y, z)
        self.add = self.__instance_add__
        self.sub = self.__instance_sub__
        self.mult = self.__instance_mult__
        self.div = self.__instance_div__
        self.cross = self.__instance_cross__
        self.dist = self.__instance_dist__
        self.dot = self.__instance_dot__
        self.lerp = self.__instance_lerp__

    @property
    def x(self):
        return self.__vector.x

    @x.setter
    def x(self, x):
        self.__vector.x = x

    @property
    def y(self):
        return self.__vector.y

    @y.setter
    def y(self, y):
        self.__vector.y = y

    @property
    def z(self):
        return self.__vector.z

    @z.setter
    def z(self, z):
        self.__vector.z = z

    @property
    def mag(self):
        return self.__vector.mag()

    @mag.setter   # py5 compat
    def mag(self, mag):
        self.set_mag(mag)

    @property
    def mag_sq(self):
        return self.__vector.magSq()

    def set_mag(self, mag):
        self.__vector.setMag(mag)
        return self

    # py5 compat
    @property
    def norm(self):
        n = self.copy()
        n.normalize()
        return n

    def normalize(self):
        self.__vector.normalize()
        return self

    def limit(self, max):
        self.__vector.limit(max)
        return self

    def heading(self):
        return self.__vector.heading()

    def rotate(self, angle):
        self.__vector.rotate(angle)
        return self

    def __instance_add__(self, *args):
        if len(args) == 1:
            return Py5Vector.add(self, args[0], self)
        else:
            return Py5Vector.add(self, Py5Vector(*args), self)

    def __instance_sub__(self, *args):
        if len(args) == 1:
            return Py5Vector.sub(self, args[0], self)
        else:
            return Py5Vector.sub(self, Py5Vector(*args), self)

    def __instance_mult__(self, o):
        return Py5Vector.mult(self, o, self)

    def __instance_div__(self, f):
        return Py5Vector.div(self, f, self)

    def __instance_cross__(self, o):
        return Py5Vector.cross(self, o, self)

    def __instance_dist__(self, o):
        return Py5Vector.dist(self, o)

    def __instance_dot__(self, *args):
        if len(args) == 1:
            v = args[0]
        else:
            v = args
        return self.x * v[0] + self.y * v[1] + self.z * v[2]

    def __instance_lerp__(self, *args):
        if len(args) == 2:
            return Py5Vector.lerp(self, args[0], args[1], self)
        else:
            vx, vy, vz, f = args
            return Py5Vector.lerp(self, Py5Vector(vx, vy, vz), f, self)

    def get(self):
        return Py5Vector(self.x, self.y, self.z)

    def copy(self):
        return Py5Vector(self.x, self.y, self.z)

    def __getitem__(self, k):
        return getattr(self, ('x', 'y', 'z')[k])

    def __setitem__(self, k, v):
        setattr(self, ('x', 'y', 'z')[k], v)

    def __copy__(self):
        return Py5Vector(self.x, self.y, self.z)

    def __deepcopy__(self, memo):
        return Py5Vector(self.x, self.y, self.z)

    def __repr__(self):  # PROVISÓRIO
        return f'Py5Vector({self.x}, {self.y}, {self.z})'

    def set(self, *args):
        """
        Sets the x, y, and z component of the vector using two or three separate
        variables, the data from a p5.Vector, or the values from a float array.
        """
        self.__vector.set(*args)

    @classmethod
    def add(cls, a, b, dest=None):
        if dest is None:
            return Py5Vector(a.x + b[0], a.y + b[1], a.z + b[2])
        dest.__vector.set(a.x + b[0], a.y + b[1], a.z + b[2])
        return dest

    @classmethod
    def sub(cls, a, b, dest=None):
        if dest is None:
            return Py5Vector(a.x - b[0], a.y - b[1], a.z - b[2])
        dest.__vector.set(a.x - b[0], a.y - b[1], a.z - b[2])
        return dest

    @classmethod
    def mult(cls, a, b, dest=None):
        if dest is None:
            return Py5Vector(a.x * b, a.y * b, a.z * b)
        dest.__vector.set(a.x * b, a.y * b, a.z * b)
        return dest

    @classmethod
    def div(cls, a, b, dest=None):
        if dest is None:
            return Py5Vector(a.x / b, a.y / b, a.z / b)
        dest.__vector.set(a.x / b, a.y / b, a.z / b)
        return dest

    @classmethod
    def dist(cls, a, b):
        return a.__vector.dist(b.__vector)

    @classmethod
    def dot(cls, a, b):
        return a.__vector.dot(b.__vector)

    def __add__(a, b):
        return Py5Vector.add(a, b, None)

    def __sub__(a, b):
        return Py5Vector.sub(a, b, None)

    def __isub__(a, b):
        a.sub(b)
        return a

    def __iadd__(a, b):
        a.add(b)
        return a

    def __mul__(a, b):
        if not isinstance(b, Number):
            raise TypeError(
                "The * operator can only be used to multiply a Py5Vector by a number")
        return Py5Vector.mult(a, float(b), None)

    def __rmul__(a, b):
        if not isinstance(b, Number):
            raise TypeError(
                "The * operator can only be used to multiply a Py5Vector by a number")
        return Py5Vector.mult(a, float(b), None)

    def __imul__(a, b):
        if not isinstance(b, Number):
            raise TypeError(
                "The *= operator can only be used to multiply a Py5Vector by a number")
        a.__vector.mult(float(b))
        return a

    def __truediv__(a, b):
        if not isinstance(b, Number):
            raise TypeError(
                "The * operator can only be used to multiply a Py5Vector by a number")
        return Py5Vector(a.x / float(b), a.y / float(b), a.z / float(b))

    def __itruediv__(a, b):
        if not isinstance(b, Number):
            raise TypeError(
                "The /= operator can only be used to multiply a Py5Vector by a number")
        a.__vector.set(a.x / float(b), a.y / float(b), a.z / float(b))
        return a

    def __eq__(a, b):
        return a.x == b[0] and a.y == b[1] and a.z == b[2]

    def __lt__(a, b):
        return a.magSq() < b.magSq()

    def __le__(a, b):
        return a.magSq() <= b.magSq()

    def __gt__(a, b):
        return a.magSq() > b.magSq()

    def __ge__(a, b):
        return a.magSq() >= b.magSq()

    # Problematic class methods, we would rather use p5.Vector when possible...

    @classmethod
    def lerp(cls, a, b, f, dest=None):
        v = createVector(a.x, a.y, a.z)
        v.lerp(b.__vector, f)
        if dest is None:
            return Py5Vector(v.x, v.y, v.z)
        dest.set(v.x, v.y, v.z)
        return dest

    @classmethod
    def cross(cls, a, b, dest=None):
        x = a.y * b[2] - b[1] * a.z
        y = a.z * b[0] - b[2] * a.x
        z = a.x * b[1] - b[0] * a.y
        if dest is None:
            return Py5Vector(x, y, z)
        dest.set(x, y, z)
        return dest

    @classmethod
    def fromAngle(cls, angle, length=1):
        # https://github.com/processing/p5.js/blob/3f0b2f0fe575dc81c724474154f5b23a517b7233/src/math/p5.Vector.js
        return cls(length * cos(angle), length * sin(angle), 0)

    @classmethod
    def fromAngles(theta, phi, length=1):
        # https://github.com/processing/p5.js/blob/3f0b2f0fe575dc81c724474154f5b23a517b7233/src/math/p5.Vector.js
        cosPhi = cos(phi)
        sinPhi = sin(phi)
        cosTheta = cos(theta)
        sinTheta = sin(theta)
        return cls(length * sinTheta * sinPhi,
                       -length * cosTheta,
                       length * sinTheta * cosPhi)

    @classmethod
    def random(cls, dim=2): # py5 compat
        if dim == 3:
            return cls.random3D()
        else:
            return cls.fromAngle(random(TWO_PI))

    @classmethod
    def random2D(cls):
        return cls.fromAngle(random(TWO_PI))

    @classmethod
    def random3D(cls, dest=None):
        angle = random(TWO_PI)
        vz = random(2) - 1
        mult = sqrt(1 - vz * vz)
        vx = mult * cos(angle)
        vy = mult * sin(angle)
        if dest is None:
            return cls(vx, vy, vz)
        dest.set(vx, vy, vz)
        return dest

    @classmethod
    def angleBetween(cls, a, b):
        return acos(a.dot(b) / sqrt(a.magSq() * b.magSq()))

    # Other harmless p5js methods

    def equals(self, v):
        return self == v

    def heading2D(self):
        return self.__vector.heading()

    def reflect(self, *args):
        # Reflect the incoming vector about a normal to a line in 2D, or about
        # a normal to a plane in 3D This method acts on the vector directly
        r = self.__vector.reflect(*args)
        return r

    def array(self):
        # Return a representation of this vector as a float array. This is only
        # for temporary use. If used in any w fashion, the contents should be
        # copied by using the p5.Vector.copy() method to copy into your own
        # array.
        return self.__vector.array()

    def toString(self):
        # Returns a string representation of a vector v by calling String(v) or v.toString().
        # return self.__vector.toString() would be something like "p5.vector
        # Object […, …, …]"
        return str(self)

    def rem(self, *args):
        # Gives remainder of a vector when it is divided by anw vector. See
        # examples for more context.
        self.__vector.rem(*args)
        return self

Vector = PVector = Py5Vector

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
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      packages: ["micropip", "numpy"],
    });

    await this._pyodide.runPythonAsync(`
      import io, code, sys
      from js import p5, window, document
      print(sys.version)
    `);

    this.initialized = true;
    // console.log("Py5 initialized");
    this._onWarning("Py5 initialized");
  }

  async tryEval(userCode: string) {
    if (!this.initialized) await this.initialize();

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

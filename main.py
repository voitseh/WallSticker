from flask import Flask, g, url_for, abort
from flask import render_template
import uuid
import flask_sijax
import os, glob
from imgproc import imgproc as impr
from threading import Timer
import  base64 
import cv2
import logging

# The path where you want the extension to create the needed javascript files
# DON'T put any of your files in this directory, because they'll be deleted!
path = os.path.join('.', os.path.dirname(__file__), 'static/js/sijax/')

app = Flask(__name__)
app.config['SIJAX_STATIC_PATH'] = path
# You need to point Sijax to the json2.js library if you want to support
# browsers that don't support JSON natively (like IE <= 7)
app.config['SIJAX_JSON_URI'] = '/static/js/sijax/json2.js'
flask_sijax.Sijax(app)

APP_ROOT = "/home/voitseh/Projects/wallsticker"
UPLOAD_FOLDER = os.path.join(app.root_path, 'static/images')
WALL_FOLDER = os.path.join(UPLOAD_FOLDER, 'wall_gallery')
STICKER_FOLDER = os.path.join(UPLOAD_FOLDER, 'sticker_gallery')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024

curFrame = None
clickedBttnName = ""
gallery_img_dimensions = ('100px','100px')
edit_img_dimensions = ('300px','400px')

gallery_ID = ""

# temporary filenames for top galleries auto editing
wallFile = ""
stickerFile = ""

sticker_center = False
repeat_x = None
repeat_y = None
opacity = None

filenames_list = []

class Frame:
    def __init__(self,id):
        self.id = id
        self.items = {'wallFile':None, 'maskFile':None,'stickerFile':None}

            
def decode_img(encoded_img, prefix, f_name_key=''):
    b64file = encoded_img
    ext = b64file.split(',')[0].split('/')[1].split(';')[0]
    f_name = rename_file(UPLOAD_FOLDER, prefix, ext)
    if f_name_key != '':
        curFrame.items[f_name_key] = f_name
    if ',' in b64file:
        imgdata = b64file.split(',')[1]
        decoded = base64.b64decode(imgdata)
        write_file(f_name, decoded)


#################### UTILS ###############################
def save_file(file,filename):
    file.save(filename)
  
def rename_file(folder, prefix, file_ext):
    filename = os.path.join(folder, prefix + str(uuid.uuid4())+ '.{}'.format(file_ext))
    return filename

def remove_file(filename, default_folder = app.config['UPLOAD_FOLDER']):
    filepath = os.path.join(default_folder,filename)
    if os.path.isfile(filepath):
        os.remove(filepath)

def remove_files(file_dict):
    for key, value in file_dict.items():
        remove_file(value)

def write_file(f_name, file):
    with open(f_name, 'wb') as f:
        f.write(file)
#################### FOR BOTTOM GALLERY IMAGES AND LARGE IMAGE ###############################
def remove_img(obj_response, img_id):
    obj_response.script("$('#%s').remove()"%(img_id));

def show_img(obj_response, parent_id, img_id,  img_dimensions, new_img):
    obj_response.script("$('#%s').append($('<img >',{style:'position:absolute;left:0px;top:0px;z-index: 2;',height:'%s',width:'%s',id:'%s',src:'%s'}));"%(parent_id, img_dimensions[0], img_dimensions[1], img_id, new_img) )
    
def change_img(obj_response, parent_id, img_id,  img_dimensions, new_img):
    #remove previous image from gallery
    if img_id != None:
        remove_img(obj_response, img_id);
    #send new image to frame
    show_img(obj_response, parent_id, img_id,  img_dimensions, new_img)
   
def response(obj_response, parent_id, img_id, filename,  img_dimensions):
    filename = filename.split('/')[-1]
    result = url_for('static', filename='images/{}'.format(filename))
    change_img(obj_response, parent_id, img_id,  img_dimensions, result)
    filenames_list.append(filename)
   
    
###################### GALLERIES ##############################
def remove_gallery_imgs(obj_response, parent_id):
    obj_response.script("$('#%s').children().remove()"%(parent_id));

def show_gallery_img(obj_response, parent_id, img_id, new_img):
    obj_response.script("$('#%s').append($('<li>',{title:'Click right to delete!'}).append($('<a href=#>').append($('<img>',{id:'%s', src:'%s'}))));"%(parent_id, img_id, new_img))
   
def response_to_gallery(obj_response, parent_id, img_id, filename):
    filename = filename.split('/')[-1]
    result = url_for('static', filename='images/{}/{}'.format(parent_id,filename))
    show_gallery_img(obj_response, parent_id, img_id, result) 

def fill_gallery(obj_response, src_dir, gallery_ID):
    index = 0
    remove_gallery_imgs(obj_response, gallery_ID)
    if os.path.exists(src_dir):
        for filename in glob.glob(os.path.join( src_dir, "*.*")):
            img_id = '_img{}'.format(str(index))
            index += 1
            #senf new image to frame
            response_to_gallery(obj_response, gallery_ID, img_id, filename) 
    else: 
         print("{} is not exist!".format(src_dir))

################# RESPONSE MASK ########################
def black_to_transparent(file_name):
    src = cv2.imread(file_name, 1)
    tmp = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    _,alpha = cv2.threshold(tmp,0,255,cv2.THRESH_BINARY)
    b, g, r = cv2.split(src)
    rgba = [b,g,r, alpha]
    dst = cv2.merge(rgba,4)
    cv2.imwrite(file_name, dst)

def send_wall_mask(obj_response, filename):
    wall = cv2.imread(filename, cv2.IMREAD_COLOR)
    mask, bound_box, contour = impr.generate_mask(wall)
    filename = os.path.join(UPLOAD_FOLDER, 'mask-' + str(uuid.uuid4())+ '.png')
    cv2.imwrite(filename, mask)
    black_to_transparent(filename)
    filename = filename.split('WallSticker')[-1]
    obj_response.script("$(mask).attr('src','%s');"%filename)
    
    timer = Timer(7, remove_file, [filename.split('/')[-1]])
    timer.start()
 
# save inputed Wall or Sticker files before response it to gaLLery
def save_to_subfolder(file, gallery_ID):
    if not os.path.exists(WALL_FOLDER):
        os.makedirs(WALL_FOLDER)
    if not os.path.exists(STICKER_FOLDER):
        os.makedirs(STICKER_FOLDER)
    file_ext = file.filename.split('.')[-1]
    if gallery_ID == 'wall_gallery':
        filename = rename_file(WALL_FOLDER, 'wall-', file_ext)
        save_file(file,filename)
    else:
        filename = rename_file(STICKER_FOLDER, 'sticker-', file_ext)
        save_file(file,filename)

class SijaxHandler(object):
    
    """A container class for all Sijax handlers.
    Grouping all Sijax handler functions in a class
    (or a Python module) allows them all to be registered with
    a single line of code.
    """
    # data from current Frame object
    @staticmethod
    def client_data(obj_response, client_data):
        global  clickedBttnName, gallery_ID, wallFile, stickerFile, curFrame
        # handle adding new bottom gallery frame
        if  'lastFrameId' in client_data:
            lastFrameId = client_data['lastFrameId']
            curFrame = Frame(lastFrameId)
        
        # handle current frame id 
        if  'curFrameId' in client_data:
            curFrame.id = client_data['curFrameId']
        
        # handle deleted top gallery image
        if  'delGalleryImg' in client_data:
            filename = client_data['delGalleryImg'].split('/')[-1]
            if 'wall_gallery' in client_data['delGalleryImg']:
                remove_file(filename, WALL_FOLDER)
            if 'sticker_gallery' in client_data['delGalleryImg']:
                remove_file(filename, STICKER_FOLDER)

        # all Frame items are loaded
        if '_completed' in client_data:
            for f_name in filenames_list:
                remove_file(f_name)
            del filenames_list[:]
        
        if  'clickedCircle' in client_data:
            clickedBttnName = client_data['clickedCircle']
        
        # handle Wall || Sticker gallery checked Event to fill appropriate gallery
        if  'wall_gallery' in client_data:
            gallery_ID = client_data['wall_gallery']
            fill_gallery(obj_response, WALL_FOLDER, gallery_ID)
           
        if  'sticker_gallery' in client_data:
            gallery_ID = client_data['sticker_gallery']
            fill_gallery(obj_response, STICKER_FOLDER, gallery_ID)

        # handle needed mask for wall gallery image
        if 'wall_mask' in client_data:
            filename = os.path.join(WALL_FOLDER, client_data['wall_mask'].split('/')[-1])
            send_wall_mask(obj_response, filename)
            # uses for top galleries images editing with auto mode
            wallFile = filename

        if 'sticker' in client_data:
            stickerFile = client_data['sticker'] .split('/')[-1]
            stickerFile = os.path.join(STICKER_FOLDER, stickerFile)

        # apply result images from bottom gallery into UPLOAD_FOLDER
        if 'imagesDict' in client_data:
            for img_item in client_data['imagesDict']:
                if img_item != None:
                    if '_result' in img_item:
                        decode_img(img_item['_result'], 'result-')
                        
        # apply curFrameItems values from bottom gallery into UPLOAD_FOLDER
        if 'curFrameItems' in client_data:
            
            for img_item in client_data['curFrameItems']:
                if img_item != None:
                    if '_wall' in img_item:
                        decode_img(img_item['_wall'], 'wall-', 'wallFile')
                    if '_mask' in img_item:
                        decode_img( img_item['_mask'], 'mask-', 'maskFile')
                    if '_sticker' in img_item:
                        decode_img(img_item['_sticker'], 'sticker-', 'stickerFile')
                    break;
            
            # auto edit images from bottom gallery
            if curFrame != None:
                if  curFrame.items['wallFile'] != None and curFrame.items['stickerFile'] != None:
                    remove_img(obj_response, 'theImg')
                    process(obj_response, curFrame.items['wallFile'], curFrame.items['stickerFile'], curFrame.items['maskFile']);
                    remove_files(curFrame.items)
            
            # auto edit images from top galleries  
            if wallFile != "" and stickerFile != "":
               process(obj_response, wallFile, stickerFile);
            
    @staticmethod
    def _dump_data(obj_response, files, form_values, container_id = ''):
        global sticker_center,repeat_x,repeat_y,opacity, gallery_ID, clickedBttnName, curFrame    
        ########## dump form_values data #####################
        # handle form values change in auto mode form
        if 'sticker_center' in form_values:   
            sticker_center = form_values['sticker_center'][0]
            #print(sticker_center)
        if 'repeat_x' in form_values: 
            repeat_x = form_values['repeat_x'][0]
            #print(repeat_x)
        if 'repeat_y' in form_values: 
            repeat_y = form_values['repeat_y'][0]
            #print(repeat_y)
        if 'opacity' in form_values: 
            opacity = form_values['opacity'][0]
       
       
        ############## dump files data ########################
        # handle wallFile, stickerFile or maskFile loading in frame (bottom gallery)
        if 'selectedFile' in files:
            file = files['selectedFile']
            #set current Frame class properties
            if clickedBttnName == 'Wall': 
                curFrame.items['wallFile'] = rename_file(UPLOAD_FOLDER,'wall-', 'png')
                save_file(file, curFrame.items['wallFile'] )
                response(obj_response, curFrame.id, 'img{}'.format(curFrame.id), curFrame.items['wallFile'], gallery_img_dimensions)
                
            if clickedBttnName == 'Mask':
                curFrame.items['maskFile'] = rename_file(UPLOAD_FOLDER, 'mask-', 'png')
                save_file(file, curFrame.items['maskFile'])
                response(obj_response, curFrame.id, 'img{}'.format(curFrame.id), curFrame.items['maskFile'], gallery_img_dimensions)
                    
            if clickedBttnName == 'Sticker':
                curFrame.items['stickerFile'] = rename_file(UPLOAD_FOLDER, 'sticker-', 'png')
                save_file(file, curFrame.items['stickerFile'])
                response(obj_response, curFrame.id, 'img{}'.format(curFrame.id), curFrame.items['stickerFile'], gallery_img_dimensions)
       
        ############## top galleries ###############################
        # handle loading new Wall file to send it into Wall gallery 
        if 'wallFile' in files:
            gallery_ID = 'wall_gallery'
            save_to_subfolder(files['wallFile'], gallery_ID)
            fill_gallery(obj_response, WALL_FOLDER, gallery_ID)

        # handle loading new Sticker file to send it into Sticker gallery 
        if 'stickerFile' in files:
            gallery_ID = 'sticker_gallery'
            save_to_subfolder(files['stickerFile'], gallery_ID)
            fill_gallery(obj_response, STICKER_FOLDER, gallery_ID)
            
    # handle changes in settings tab (auto mode)
    @staticmethod
    def settings_handler(obj_response, files, form_values):
       SijaxHandler._dump_data(obj_response, files, form_values)
        
    # handle files from bottom gallery
    @staticmethod
    def input_files_handler(obj_response, files, form_values):
        SijaxHandler._dump_data(obj_response, files, form_values)
    
    # handle wall or sticker files from tabs
    @staticmethod
    def input_wall_or_sticker_handler(obj_response, files, form_values):
        SijaxHandler._dump_data(obj_response, files, form_values)
       

   
@flask_sijax.route(app, "/")
def index():
    # Callback registration on each request.
    form_init_js = ''
    form_init_js += g.sijax.register_upload_callback('autoMode', SijaxHandler.settings_handler)
    form_init_js += g.sijax.register_upload_callback('inputFiles', SijaxHandler.input_files_handler)
    form_init_js += g.sijax.register_upload_callback('inputWall', SijaxHandler.input_wall_or_sticker_handler)
    form_init_js += g.sijax.register_upload_callback('inputSticker', SijaxHandler.input_wall_or_sticker_handler)
    if g.sijax.is_sijax_request:
        # Sijax request detected - let Sijax handle it
        g.sijax.register_callback('client_data', SijaxHandler.client_data) 
        # The request looks like a valid Sijax request
        # The handlers are already registered above.. we can process the request
        return g.sijax.process_request()
    return render_template('index.html', form_init_js=form_init_js)
 

def process(obj_response, wallFile, stickerFile, maskFile = None):
    global sticker_center, repeat_x, repeat_y, opacity
   
    sticker_place = False
    rx, ry = 1, 1
    alpha = 1.0
    if sticker_center:
        sticker_place = True
    if repeat_x:
        rx = int(repeat_x)
    if repeat_y:
        ry = int(repeat_y)
    if opacity:
        alpha = float(opacity)
    
    result_name = 'result-' + str(uuid.uuid4())
    result = impr.merge(wallFile, stickerFile, maskFile,
                        result_name, sticker_place, rx, ry, alpha, UPLOAD_FOLDER)
    response(obj_response, 'formCanvasResponse','theImg', result, edit_img_dimensions)
    tmp = os.path.join(app.root_path, result) 
    # remove tmp files
    tmp = os.path.join(app.root_path, result) 
    timer = Timer(5, remove_file, [tmp])
    timer.start()
    
@app.errorhandler(500)
def server_error(e):
    logging.exception('An error occurred during a request.')
    return """
    An internal error occurred: <pre>{}</pre>
    See logs for full stacktrace.
    """.format(e), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)




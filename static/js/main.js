var MAX_BOTTOM_GALLERY_FRAMES_COUNT = 4;
var frames_count = 0;
var lastFrameId = 0;
var curFrameId = 0;
var pushedFrameId = 0;
var radiusBttnsCount = 4;
var resultBttnId = 0;
//define an empty image objects dictionary
var imagesDict = [];
//define an empty deleted frameId Array
var deletedIdArray = [];
var client_data = {}
var titlesList = ['Wall', 'Mask', 'Sticker', 'Result'];
//variables for storing values of each form container
var choosenImg = '';
var clickedCircle = '';
var isWallOrStickerGalleryUsed = false;
var linearProgress = 0;
var newScale;
var opacity = 1;

class Frame {
    constructor(id) {
        this._id = id;
        this._wall = '';
        this._mask = '';
        this._sticker = '';
        this._result = '';
        this._completed = false;
    }
}
var image, mask, sticker;

var canvasOffset = $("#layer2").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;

var startX;
var startY;

var mouseX, mouseY;

var pi2 = Math.PI * 2;
var resizerRadius = 8;
var rr = resizerRadius * resizerRadius;
var draggingResizer = {
    x: 0,
    y: 0
};
var imageX = 50;
var imageY = 50;
var imageWidth, imageHeight, imageRight, imageBottom;
var draggingImage = false;
var imageClick;

var WIDTH = 400;
var HEIGHT = 300;

var scale = 1;

var isDrawStarted;

var canvas = document.getElementById('layer2'),
    canvasContext = canvas.getContext('2d');

var backCanvas = document.getElementById('layer1'),
    backContext = canvas.getContext('2d');

var canvasWidth = WIDTH;
var canvasHeight = HEIGHT;

image = new Image();
mask = new Image();
sticker = new Image();

//**************utils********************
function sijax_data(key, value) {
    client_data[key] = value;
    Sijax.request('client_data', [client_data]);
    delete client_data[key];
}

function setBttnColor(bttnId, color) {
    document.getElementById(bttnId).style.backgroundColor = color;
}

function buttonsColors(curFrameId, bttnId) {
    for (var i = 0; i < radiusBttnsCount; i++) {
        if ((curFrameId.concat(i).toString()) == bttnId) {
            setBttnColor(bttnId, 'green');
        }
        else {
            setBttnColor(curFrameId.concat(i.toString()), 'gray')
        }
    }
}

function toDataURL(_src) {
    var img = new Image();
    img.src = _src;
    img.crossOrigin = 'Anonymous';
    var canvas = document.createElement('CANVAS');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    dataURL = canvas.toDataURL();
    return dataURL;
};

/////////////////// ON PUSH PUTTON PRESSED //////////////////

function clearCanvas() {
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    backContext.clearRect(0, 0, WIDTH, HEIGHT);
}

function clearLargeImg() {
    //canvas data URL
    image.src = "";
    mask.src = "";
    sticker.src = "";
    clearCanvas();
    // clear large img, created with auto mode
    if ($('#theImg') != undefined) {
        $('#theImg').remove();
    }
}

function showResultImg(isResultFromCanvas) {
    draw(false, false);
    if (isResultFromCanvas == true) {
        imgURL = canvas.toDataURL();
    }
    else {
        imgURL = toDataURL($('#theImg').attr('src'))
    }
    if (isWallOrStickerGalleryUsed == true) {
        pushedFrameId = lastFrameId;
    }
    document.getElementById('img' + pushedFrameId).setAttribute("src", imgURL);
    imagesDict[pushedFrameId]._result = imgURL;
    imagesDict[pushedFrameId]._completed = true;
    resultBttnId = pushedFrameId.concat("3")
    buttonsColors(pushedFrameId, resultBttnId);
    pushedFrameId = 0;
}
//set Frame items values(used by pushToGallery function)
function setFrameItems() {
    imagesDict[curFrameId]._wall = toDataURL(image.src)
    imagesDict[curFrameId]._mask = toDataURL(mask.src)
    imagesDict[curFrameId]._sticker = toDataURL(sticker.src)
}

function pushToGallery() {
    if (isWallOrStickerGalleryUsed == false) {
        if (imagesDict[curFrameId] != undefined) {
            if ($('#theImg').attr('src') == undefined) {
                if (imagesDict[curFrameId]._result == "") {
                    showResultImg(true)
                    clearLargeImg();
                }
                else {
                    alert("There is not an image in a big frame!")
                }
            }
            else {
                if (imagesDict[curFrameId]._result == "") {
                    showResultImg(false)
                    clearLargeImg();
                }
                else {
                    alert("There is not an image in a big frame!")
                }
            }
        }

    }
    else {
        FramePaper();
        if (imagesDict[curFrameId] != undefined) {
            if ($('#theImg').attr('src') != undefined) {
                showResultImg(false)
                setFrameItems()
                clearLargeImg();
                isWallOrStickerGalleryUsed = false;
            }
            else {
                showResultImg(true)
                setFrameItems()
                clearLargeImg();
                isWallOrStickerGalleryUsed = false;
            }
        }
    }
    // set default state to manually and auto mode controllers
    setDefaultAutoMode();
    setDefaultManuallyMode();
}

/////////////// ON "+" BUTTON PRESSED (add bottom gallery frame) ////////////
//adds three(wall,mask,sticker) circle transparent buttons to each new image
function addRadiusBttns(lastFrameId, posDelta) {
    var radiusBttnsCount = 4;
    var posRight = 0;
    var bttnId = 0;
    var _title;
    for (i = 0; i < radiusBttnsCount; i++) {
        _title = titlesList[i];
        if (i == 3) {//result button creating
            $("<input type='button'>").attr({
                title: _title, style: 'z-index: 5;position:absolute; bottom:0px; right:'.concat((80).toString()).concat('px; height: 20px;width: 20px;border-radius: 50%;border: 1px solid white;background-color:gray'),
                id: (lastFrameId.concat(bttnId).toString())
            }).appendTo('#'.concat(lastFrameId))
        }
        else {//Wall, Mask and Sticker bttns creating
            $("<input type='button'>").attr({
                title: _title, style: 'z-index: 5;position:absolute; bottom:0px; right:'.concat((posRight).toString()).concat('px; height: 20px;width: 20px;border-radius: 50%;border: 1px solid white;background-color:gray'),
                id: (lastFrameId.concat((bttnId)).toString())
            }).appendTo('#'.concat(lastFrameId))
        }
        posRight += posDelta;
        bttnId++;
    }
}

function addDeleteButton(curFrameId) {//delete button creating
    $("<input type='button'>").attr({
        value: 'x', style: 'z-index: 5;position:absolute; top:0px; right:0px; height: 20px;width: 20px;border: 1px solid white;background-color:gray;opacity:0.2',
        id: ('del'.concat(curFrameId))
    }).appendTo('#'.concat(curFrameId))
}

var index = 0;
// adds image to bottom gallery after button "+" pressed
function addFrame(delta) {
    if (frames_count <= MAX_BOTTOM_GALLERY_FRAMES_COUNT) {
       
        frames_count++;
        if (deletedIdArray.length == 0) {
            lastFrameId = frames_count;
        }
        else {
            lastFrameId = deletedIdArray[index];
            deletedIdArray.splice(index, 1);
        }
        lastFrameId = lastFrameId.toString();
        curFrameId = lastFrameId;
        //creating new frame
        $('<form>').attr({ id: lastFrameId, style: 'z-index: 1;float:left; position:relative; margin:15px; left:20px; top:15px;  border: 1px solid rgb(204, 204, 204); height:100px; width:100px' })
            .append($('<div>').attr({ id: 'paper'.concat(lastFrameId), style: 'position:absolute;left:-30px;top:-30px;' }))
            .append($('<div>').attr({style:'position:absolute; left:-1px; top:-1px; border: 1px solid rgb(204, 204, 204);pointer-events: auto; height:100px;width:100px'}))// rect arount image
            .append($('<img>').attr({ id: 'img'.concat(lastFrameId), style: 'z-index: 2; position:absolute;left:0px;top:0px;', height: '100px', width: '100px' }))
            .appendTo('#imgsHolder');
        addRadiusBttns(lastFrameId, delta);
        addDeleteButton(lastFrameId);
        //create new Frame object(container of wall, mask and sticker itemg)
        imagesDict[lastFrameId] = new Frame(lastFrameId);
        sijax_data('lastFrameId', lastFrameId)
    }
    else {
        alert("The limit of frames is exhausted!")
    }

}
///////////////////////// HANDLE CLICK EVENTS ////////////////////
//********************** handle image click event ***************
$('body').on('click', 'img', function () {
    var imgId = this.id;
    curFrameId = $(this).parent().attr('id');
    //on bottom gallery image click
    if (curFrameId != undefined && curFrameId != "formCanvasResponse") {// prevent large image click event
        if (!image.src.includes("images")) {
            if (curFrameId in imagesDict) {
                if ((imagesDict[curFrameId]._id == curFrameId) && (imagesDict[curFrameId]._completed == false)) {
                    if ((imagesDict[curFrameId]._wall != '') && (imagesDict[curFrameId]._mask != '') && (imagesDict[curFrameId]._sticker != '')) {
                        image.src = imagesDict[curFrameId]._wall;
                        mask.src = imagesDict[curFrameId]._mask;
                        sticker.src = imagesDict[curFrameId]._sticker;
                        imagesDict[curFrameId]._completed = true;
                        pushedFrameId = curFrameId;
                        setFrameItems();
                        sijax_data('_completed', '_completed');
                    } else {
                        alert('Please,input three images: Wall, Mask and Sticker!');
                    }
                }
            }
        } else {
            alert('Please, clear large image!')
        }
    }
    //on top Wall or Sticker galleries image click
    else {
        if (frames_count <= MAX_BOTTOM_GALLERY_FRAMES_COUNT) { //add new bottom gallery frame
            isWallOrStickerGalleryUsed = true;
            if ($(this).parent().parent().parent().attr('id') == 'wall_gallery') {
                // random value not 0
                pushedFrameId = 5;
                image.src = this.getAttribute("src")
                //send image data to server.It will be used for mask creating
                sijax_data('wall_mask', image.src);
                draw(false, false);
            }
            else {
                sticker.src = this.getAttribute("src")
                sijax_data('sticker', sticker.src);

            }
        }
        else {
            alert("The limit of frames is exhausted!")
        }
    }
})

//********************** handle button click event ***************
// populate Frame object with image items(Wall, Mask, Sticker)
function populateFrame() {
    if (imagesDict[curFrameId]._completed == false) {

        switch (clickedCircle) {
            case 'Wall':
                imagesDict[curFrameId]._wall = choosenImg;
                break;
            case 'Mask':
                imagesDict[curFrameId]._mask = choosenImg;
                break;
            case 'Sticker':
                imagesDict[curFrameId]._sticker = choosenImg;
                break;
        }
        clickedCircle = '';
        choosenImg = '';
    }
}

function deleteFrame() {
    //remove section with frame
    document.getElementById(curFrameId).remove();
    frames_count--;
    //remove Frame object from imagesDict dictionary
    delete imagesDict[curFrameId];
    // push deleted curFrameId into deletedIdArray
    deletedIdArray.push(curFrameId)
    sijax_data('deletedImgId', curFrameId)
}

function onLoadImg() {
    var curFrame = document.getElementById(curFrameId);
    curFrameChildren = curFrame.children;
    checkedImgSrc = curFrameChildren[7].getAttribute("src");
    choosenImg = checkedImgSrc;
    populateFrame();
}
//this method runs when Frame items are already completed
function onRadiusBttnPressed() {
    imageSRC = document.getElementById('img'.concat(curFrameId));
    switch (clickedCircle) {
        case 'Wall':
            imageSRC.setAttribute("src", imagesDict[curFrameId]._wall);
            break;
        case 'Mask':
            imageSRC.setAttribute("src", imagesDict[curFrameId]._mask);
            break;
        case 'Sticker':
            imageSRC.setAttribute("src", imagesDict[curFrameId]._sticker);
            break;
        case 'Result':
            imageSRC.setAttribute("src", imagesDict[curFrameId]._result);
            break;
    }
}

//on wall, mask or sticker file loadeded event listener 
$("document").ready(function () { 

    jQuery(document).delegate("#imgsHolder input[type='button']", "click",
        function (e) {
            //clicked button id
            inputId = this.id;
            curFrameId = this.parentNode.id;
            //store clicked button titles in array to use in Frame object
            clickedCircle = this.title;
            buttonsColors(curFrameId, inputId);
            //handle delete button pressed  
            if ((inputId).toString().search('del') != -1) {
                deleteFrame();
            }
            //handle result button pressed
            if (curFrameId in imagesDict) {
                if (inputId.slice(-1) == 3) {
                    if (imagesDict[curFrameId]._completed == false) {
                        setBttnColor(inputId, 'gray');
                        alert('Result image is not generated yet!');
                    }
                    else {
                        onRadiusBttnPressed();
                    }
                    resultBttnId = inputId;
                }
                //handle wall, mask or sticker button pressed
                else {
                    if (imagesDict[curFrameId]._completed == false) {
                        document.getElementById('selectedFile').click()
                    }
                    else {
                        onRadiusBttnPressed();
                    }
                }
            }
            sijax_data('curFrameId', curFrameId)
            sijax_data('clickedCircle', clickedCircle)
        });
    //check wall,mask or sticker loads event
    $('input').change(function () {
        if (this.name == 'selectedFile') {
            setTimeout(onLoadImg, 100);
        }
    });
});

//******************draw canvas images********************
function drawDragAnchor(x, y) {
    canvasContext.beginPath();
    canvasContext.arc(x, y, resizerRadius, 0, pi2, false);
    canvasContext.closePath();
    canvasContext.fill();
}
function draw(withAnchors, withBorders) {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    backContext.clearRect(0, 0, canvas.width, canvas.height);
    if (opacity != 1) {
        canvasContext.globalAlpha = opacity;
    }
    canvasContext.drawImage(sticker, 0, 0, sticker.width, sticker.height, imageX, imageY, imageWidth, imageHeight);
    canvasContext.globalAlpha = 1.0;
    newScale = imageWidth / sticker.width * 100;

    // optionally draw the draggable anchors

    if (sticker.src !== '' && withAnchors) {
        //drawDragAnchor(20, 20);
        drawDragAnchor(imageX, imageY);
        drawDragAnchor(imageRight, imageY);
        drawDragAnchor(imageRight, imageBottom);
        drawDragAnchor(imageX, imageBottom);
    }

    // optionally draw the connecting anchor lines
    if (sticker.src !== '' && withBorders) {
        canvasContext.beginPath();
        canvasContext.moveTo(imageX, imageY);
        canvasContext.lineTo(imageRight, imageY);
        canvasContext.lineTo(imageRight, imageBottom);
        canvasContext.lineTo(imageX, imageBottom);
        canvasContext.closePath();
        canvasContext.stroke();
    }

    var dest = canvasContext.globalCompositeOperation;
    canvasContext.globalCompositeOperation = "destination-in";
    canvasContext.drawImage(mask, 0, 0, WIDTH, HEIGHT);
    canvasContext.globalCompositeOperation = dest;

    var dest2 = backContext.globalCompositeOperation;
    backContext.globalCompositeOperation = "destination-atop";
    backContext.drawImage(image, 0, 0, WIDTH, HEIGHT);
    backContext.globalCompositeOperation = dest2;

}

sticker.onload = function () {
    imageWidth = sticker.width;
    imageHeight = sticker.height;
    imageRight = imageX + imageWidth;
    imageBottom = imageY + imageHeight;
    draw(true, false);
    isDrawStarted = true;
}

draw(true, false);

//**************INTERFACE************************

////////////////// Tabs //////////////////////
// hide wall gallery button '+' when mouse outside wall gallery tab
function wallGalleryVisibility(flag){
    document.getElementById('inputWall').hidden = flag;
    document.getElementById('wall_gallery').hidden = flag;
}

$("#wallspan").hover(function (event) {
    // send event to Flask and fill Wall gallery with images
    sijax_data('wall_gallery', 'wall_gallery')
    wallGalleryVisibility(false)
}, function (event) {
    console.log("out")
});

$("#stickerspan").hover(function (event) {
    // send event to Flask and fill Sticker gallery with images
    sijax_data('sticker_gallery', 'sticker_gallery')
    wallGalleryVisibility(true)
}, function (event) {
    console.log("out")
});

$("#settingsspan").hover(function(event) {
    
}, function(event){
    console.log("out");
    wallGalleryVisibility(true);
});

// add Wall and Sticker files to gallery
function addWall() {
    document.getElementById('wallFile').click()
}
function addSticker() {
    document.getElementById('stickerFile').click()
}

// delete top gallery image on right click
$(function () {
    $('ul').on('contextmenu', 'li', function (e) { //Get li under ul and invoke on contextmenu
        e.preventDefault(); //Prevent defaults
        //confirm window
        if (window.confirm("Do you really want to delete an image?")) {
            $(this).remove();
            imgSRC = $(this).find('img').attr('src');
            sijax_data('delGalleryImg', imgSRC)
        }
    });
});

///////////// auto mode settings ////////////////
// auto mode form onChange
$('#autoMode').change(function () {
    // clear canvas context before showing new auto mode image
    clearCanvas();
    sijax_data('curFrameItems', imagesDict)
});

/////////////////// DRUG & SCALE ///////////////////////
function drawDragAnchor(x, y) {
    canvasContext.beginPath();
    canvasContext.arc(x, y, resizerRadius, 0, pi2, false);
    canvasContext.closePath();
    canvasContext.fill();
}

function anchorHitTest(x, y) {

    var dx, dy;

    // top-left
    dx = x - imageX;
    dy = y - imageY;
    if (dx * dx + dy * dy <= rr) {
        return (0);
    }
    // top-right
    dx = x - imageRight;
    dy = y - imageY;
    if (dx * dx + dy * dy <= rr) {
        return (1);
    }
    // bottom-right
    dx = x - imageRight;
    dy = y - imageBottom;
    if (dx * dx + dy * dy <= rr) {
        return (2);
    }
    // bottom-left
    dx = x - imageX;
    dy = y - imageBottom;
    if (dx * dx + dy * dy <= rr) {
        return (3);
    }
    return (-1);

}

function hitImage(x, y) {
    if (sticker.src != "")
        return (x > imageX && x < imageX + imageWidth && y > imageY && y < imageY + imageHeight);
}

function handleMouseDown(e) { 
    if (pushedFrameId != 0) {//canvas is clear
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
        draggingResizer = anchorHitTest(startX, startY);
        draggingImage = draggingResizer < 0 && hitImage(startX, startY);
    }
}

function handleMouseUp(e) {
    draggingResizer = -1;
    draggingImage = false;
    if ($(image).attr('src') != '') {
        draw(true, false);
    }
}

function handleMouseOut(e) {
    handleMouseUp(e);
}

function handleMouseMove(e) {

    if (draggingResizer > -1) {

        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        // resize the image
        switch (draggingResizer) {
            case 0:
                //top-left
                imageX = mouseX;
                imageWidth = imageRight - mouseX;
                imageY = mouseY;
                imageHeight = imageBottom - mouseY;
                break;
            case 1:
                //top-right
                imageY = mouseY;
                imageWidth = mouseX - imageX;
                imageHeight = imageBottom - mouseY;
                break;
            case 2:
                //bottom-right
                imageWidth = mouseX - imageX;
                imageHeight = mouseY - imageY;
                break;
            case 3:
                //bottom-left
                imageX = mouseX;
                imageWidth = imageRight - mouseX;
                imageHeight = mouseY - imageY;
                break;
        }

        if (imageWidth < 25) { imageWidth = 25; }
        if (imageHeight < 25) { imageHeight = 25; }

        // set the image right and bottom
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;

        // redraw the image with resizing anchors
        draw(true, true);

    } else if (draggingImage) {

        imageClick = false;

        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        // move the image by the amount of the latest drag
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        imageX += dx;
        imageY += dy;
        imageRight += dx;
        imageBottom += dy;
        // reset the startXY for next time
        startX = mouseX;
        startY = mouseY;

        // redraw the image with border
        draw(false, true);

    }
}

$("#layer2").mousedown(function (e) {
    handleMouseDown(e);
});
$("#layer2").mousemove(function (e) {
    handleMouseMove(e);
});
$("#layer2").mouseup(function (e) {
    handleMouseUp(e);
});
$("#layer2").mouseout(function (e) {
    handleMouseOut(e);
});

/////////////////toggle button///////////////////
function set_toggle_state(manuallyMode, autoMode, toggle_state) {
    if (toggle_state == 'checked') {
        document.getElementById(manuallyMode).hidden = true;
        document.getElementById(autoMode).hidden = false;
    }
    else {
        document.getElementById(autoMode).hidden = true;
        document.getElementById(manuallyMode).hidden = false;
    }
}
window.onload = function () {// default settings mode
    set_toggle_state("manuallyMode", "autoMode", 'unchecked');
}
$('[type="checkbox"]').click(function () {
    if ($(this).children().context.id == 'toggle') {
        if ($(this).attr('checked')) {
            $(this).removeAttr('checked');
            $(this).prop('checked', false);
            set_toggle_state("manuallyMode", "autoMode", 'unchecked');
        } else {
            $(this).attr('checked', 'checked');
            set_toggle_state("manuallyMode", "autoMode", 'checked');
        }
    }
});

//****************** DOWNLOAD AND APPLY IMAGES *****************
/* Download an img */
function download(img, title) {
    var download = document.createElement('a');
    download.href = img;
    download.download = title;
    download.click();
    //for firefox
    fireEvent(download, 'click')
}
//for firefox browsers:
function fireEvent(obj, evt) {
    var fireOnThis = obj;
    if (document.createEvent) {
        var evObj = document.createEvent('MouseEvents');
        evObj.initEvent(evt, true, false);
        fireOnThis.dispatchEvent(evObj);
    } else if (document.createEventObject) {
        var evObj = document.createEventObject();
        fireOnThis.fireEvent('on' + evt, evObj);
    }
}

// result images count in imagesDict(uses in linear progress bar)
function resCount() {
    count = 0;
    for (var key in imagesDict) {
        if (imagesDict[key]._result != "") {
            count++;
        }
    }
    return count;
}
function onDownload() {
    var downloaded = 0;
    maxCount = resCount();
    for (var key in imagesDict) {
        if (imagesDict[key]._result != "") {
            title = 'result-'.concat(key);
            download(imagesDict[key]._result, title)
            downloaded++;
            linearProgress = (downloaded / maxCount) * 100;
            setPercent(linearProgress);
        }
    }
    setTimeout(setPercent, 1000, 0);
}


//******************apply images********************
function onApply() {
    var applyed = 0;
    maxCount = resCount();
    for (var key in imagesDict) {
        if (imagesDict[key]._result != "") {
            applyed++;
            linearProgress = (applyed / maxCount) * 100;
            setPercent(linearProgress);
        }
    }
    setTimeout(setPercent, 1000, 0);
    sijax_data('imagesDict', imagesDict)
}
// scale progress bar
$('#linearProgress').css({ transform: 'scale(1.495)' });


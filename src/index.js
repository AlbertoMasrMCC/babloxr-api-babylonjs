import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

const LINKED_UP = 1;
const LINKED_DOWN = 2;
const LINKED_LEFT = 3;
const LINKED_RIGHT = 4;
const LINKED_CENTER = 5;

/** 
 * @param {number} width - Ancho de la ventana en pixeles
 * @param {number} heighW - Altura de la ventana en pixeles
 * @param {string} title - Titulo de la ventana
 * @param {BABYLON.Scene} scene - Escena de babylon
 * @returns {BABYLON.Mesh} - Malla de la barra superior
**/
const createBar = (width, heighW, title, scene) => {

    const barMesh = BABYLON.MeshBuilder.CreatePlane(`barMesh_${title}`, {
        height: heighW * 0.01 / 4, 
        width: width * 0.01, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    const barTexture = GUI.AdvancedDynamicTexture.CreateForMesh(barMesh);
    barTexture.scaleTo(width, heighW);

    const barRectangle = new GUI.Rectangle(`barRectangle_${title}`);
    barRectangle.cornerRadius = 20;
    barRectangle.color = "#2acaea";
    barRectangle.thickness = 7;
    barRectangle.background = '#00000066';

    const barGrid = new GUI.Grid(`barGrid_${title}`);
    barGrid.addRowDefinition(1);
    barGrid.addColumnDefinition(.77, false);

    const barText = new GUI.TextBlock(`barText_${title}`);
    barText.fontFamily = "Helvetica";
    barText.text = title;
    barText.color = "white";
    barText.fontSize = "20%";
    barText.textWrapping = true;
    barText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    barGrid.addControl(barText, 0, 0);

    barRectangle.addControl(barGrid);
    barTexture.addControl(barRectangle);

    return barMesh;

}

/**
 * @param {number} width - Ancho de la ventana en pixeles
 * @param {number} heighW - Altura de la ventana en pixeles
 * @param {BABYLON.Mesh} videoMesh - Malla del video que se eliminara al cerrar la ventana
 * @param {BABYLON.VideoTexture} videoTexture - Textura del video que se pausara o reproducira
 * @param {BABYLON.Scene} scene - Escena de babylon
 * @returns {BABYLON.Mesh} - Malla de los botones de control
**/
const createControls = (width, heighW, videoMesh, videoTexture, scene) => {

    const botonesMesh = BABYLON.MeshBuilder.CreatePlane(`botonesMesh`, {
        height: heighW * 0.01 / 4, 
        width: width * 0.01, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    const botonTexture = GUI.AdvancedDynamicTexture.CreateForMesh(botonesMesh);

    const botonsGrid = new GUI.Grid(`botonsGrid`);
    botonsGrid.addColumnDefinition(0.5);
    botonsGrid.addColumnDefinition(0.5);

    const playButton = GUI.Button.CreateSimpleButton(`playButton`);
    playButton.textBlock.text = "Reproducir";
    playButton.color = "white";
    playButton.background = "green";
    playButton.fontSize = "10%";
    playButton.textWrapping = true;
    playButton.fontFamily = "Helvetica";

    const omiteButton = GUI.Button.CreateSimpleButton(`omiteButton`);
    omiteButton.textBlock.text = "Omitir";
    omiteButton.color = "white";
    omiteButton.background = "red";
    omiteButton.fontSize = "10%";
    omiteButton.textWrapping = true;
    omiteButton.fontFamily = "Helvetica";

    playButton.onPointerClickObservable.add(() => {

        if(videoTexture.video.paused) {
            videoTexture.video.play();
            videoTexture.video.muted = false;
            playButton.textBlock.text = "Pausar";
            playButton.background = "yellow";
            playButton.color = "black";
        } else {
            videoTexture.video.pause();
            videoTexture.video.muted = true;
            playButton.textBlock.text = "Reproducir";
            playButton.background = "green";
            playButton.color = "white";
        }
    });

    omiteButton.onPointerClickObservable.add(() => {
        videoTexture.video.play();
        videoTexture.video.muted = false;
        videoMesh.dispose();
        botonesMesh.dispose();
    });

    botonsGrid.addControl(playButton, 0, 0);
    botonsGrid.addControl(omiteButton, 0, 1);

    botonTexture.addControl(botonsGrid);

    return botonesMesh;

}

/**
 * @param {BABYLON.Mesh} meshParent - Malla padre de la que se obtendra la posicion
 * @param {BABYLON.Mesh} meshChild - Malla hijo que se asociara a la malla padre y ajustara la posicion
 * @param {number} position - Indica la posicion en la que se ajustara la malla hijo (Arriba, abajo, derecha, izquierda, centro), si no se envia nada por defecto es centro
 * @returns {void} - No retorna nada
**/
const linkMeshes = (meshParent, meshChild, position = LINKED_CENTER) => {
    
    let ajust_pos = null;
    let change_axis = null;

    switch(position) {
        case LINKED_UP:
            ajust_pos = meshParent.getBoundingInfo().boundingBox.maximum.y + meshChild.getBoundingInfo().boundingBox.maximum.y
            change_axis = new BABYLON.Vector3(0, ajust_pos, 0);
        break;

        case LINKED_DOWN:
            ajust_pos = meshParent.getBoundingInfo().boundingBox.maximum.y + meshChild.getBoundingInfo().boundingBox.maximum.y
            change_axis = new BABYLON.Vector3(0, -ajust_pos, 0);
        break;

        case LINKED_RIGHT:
            ajust_pos = meshParent.getBoundingInfo().boundingBox.maximum.x + meshChild.getBoundingInfo().boundingBox.maximum.x
            change_axis = new BABYLON.Vector3(ajust_pos, 0, 0);
        break;

        case LINKED_LEFT:
            ajust_pos = meshParent.getBoundingInfo().boundingBox.maximum.x + meshChild.getBoundingInfo().boundingBox.maximum.x
            change_axis = new BABYLON.Vector3(-ajust_pos, 0, 0);
        break;

        case LINKED_CENTER:
            change_axis = new BABYLON.Vector3(0, 0, 0);
        break;
    }

    meshChild.parent = meshParent;
    meshChild.position = change_axis;
}

/** 
 * @param {number} heigh - Altura de la ventana en pixeles
 * @param {number} width - Ancho de la ventana en pixeles
 * @param {string} title - Titulo de la ventana
 * @param {string} text - Texto de la ventana
 * @param {boolean} showButton - Indica si se mostrara el boton de cerrar
 * @param {BABYLON.Scene} scene - Escena de babylon
 * @returns {BABYLON.Mesh} - Malla de la ventana
**/
function createWindow(heigh, width, title, text, showButton, scene) {

    const barMesh = createBar(width, heigh, title, scene);

    const windowMesh = BABYLON.MeshBuilder.CreatePlane(`windowMesh_${title}`, {
        height: heigh * 0.01, 
        width: width * 0.01, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    const windowTexture = GUI.AdvancedDynamicTexture.CreateForMesh(windowMesh);
    windowTexture.scaleTo(width, heigh);

    const windowRectangle = new GUI.Rectangle(`windowRectangle_${title}`);
    windowRectangle.background = "#ffffffd9";
    windowRectangle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    windowRectangle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    const windowGrid = new GUI.Grid(`windowGrid_${title}`);
    windowGrid.addRowDefinition(0.8, false);
    windowGrid.addRowDefinition(0.2, false);

    const windowText = new GUI.TextBlock(`windowText_${title}`);
    windowText.fontFamily = "Helvetica";
    windowText.text = text;
    windowText.color = "black";
    windowText.fontSize = 70;
    windowText.textWrapping = true;

    if(showButton) {

        const windowButton = GUI.Button.CreateSimpleButton(`windowButton_${title}`, "Ok");
        windowButton.fontFamily = "Helvetica";
        windowButton.color = "black";
        windowButton.background = "#2acaea";
        windowButton.fontSize = 50;
        windowButton.borderColor = "black";
        windowButton.cornerRadius = 20;
        windowButton.width = "80%";
        windowButton.paddingBottom = "10px";
        windowButton.onPointerUpObservable.add(() => {
            windowMesh.dispose();
            barMesh.dispose();
        });
    
        windowGrid.addControl(windowButton, 1, 0);

    }

    
    windowGrid.addControl(windowText, 0, 0);
    windowRectangle.addControl(windowGrid);
    windowTexture.addControl(windowRectangle);

    linkMeshes(windowMesh, barMesh, LINKED_UP);

    return windowMesh;

}

/**
 * @param {number} heigh - Altura de la ventana en pixeles
 * @param {number} width - Ancho de la ventana en pixeles
 * @param {string} title - Titulo de la ventana
 * @param {string} question - Pregunta a mostrar en la ventana
 * @param {number} correct_answer - Indice de la respuesta correcta
 * @param {string} correct_message - Mensaje a mostrar si la respuesta es correcta
 * @param {string} incorrect_message - Mensaje a mostrar si la respuesta es incorrecta
 * @param {BABYLON.Scene} scene - Escena de babylon
 * @param {string[]} answers - Respuestas a mostrar en la ventana (Se envÃ­a de manera individual)
 * @returns {BABYLON.Mesh} - Malla de la ventana
**/
function createTest(heigh, width, title, question, correct_answer, correct_message, incorrect_message, scene, ...answers) {

    const barMesh = createBar(width, heigh, title, scene);

    const testMesh = BABYLON.MeshBuilder.CreatePlane(`testMesh_${title}`, {
        height: heigh * 0.01, 
        width: width * 0.01, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    const testTexture = GUI.AdvancedDynamicTexture.CreateForMesh(testMesh);
    testTexture.scaleTo(width, heigh);

    const testRectangle = new GUI.Rectangle(`testRectangle_${title}`);
    testRectangle.background = "#ffffffd9";
    testRectangle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    testRectangle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    const testGrid = new GUI.Grid(`testGrid_${title}`);
    testGrid.addRowDefinition(1, false);
    testGrid.addRowDefinition(0.8, false);
    testGrid.addRowDefinition(0.3, false);

    // Pregunta
    const testText = new GUI.TextBlock(`testText_${title}`);
    testText.fontFamily = "Helvetica";
    testText.text = question;
    testText.color = "black";
    testText.fontSize = 70;
    testText.textWrapping = true;

    // Respuestas
    const testAnswersGrid = new GUI.Grid(`testAnswersGrid_${title}`);
    testAnswersGrid.addRowDefinition(0.2, false);
    testAnswersGrid.addRowDefinition(0.8, false);

    let selected_answer = null;

    for(let i = 0; i < answers.length; i++) {

        testAnswersGrid.addColumnDefinition(1, false);

        const answerLabel = new GUI.TextBlock(`answerLabel_${title}_${i}`);
        answerLabel.fontFamily = "Helvetica";
        answerLabel.text = answers[i];
        answerLabel.color = "black";
        answerLabel.fontSize = 50;
        answerLabel.textWrapping = true;
        answerLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        answerLabel.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        const answerRadioButton = new GUI.RadioButton(`answerRadioButton_${title}_${i}`);
        answerRadioButton.width = "40px";
        answerRadioButton.height = "40px";
        answerRadioButton.color = "black";
        answerRadioButton.background = "white";
        answerRadioButton.isChecked = false;
        answerRadioButton.onIsCheckedChangedObservable.add((state) => {
            if(state) {
                selected_answer = i;
            }
        });

        testAnswersGrid.addControl(answerLabel, 0, i);
        testAnswersGrid.addControl(answerRadioButton, 1, i);

    }

    // BotÃ³n de envÃ­o
    const testSubmitButton = GUI.Button.CreateSimpleButton(`testSubmitButton_${title}`, "Enviar");
    testSubmitButton.fontFamily = "Helvetica";
    testSubmitButton.color = "black";
    testSubmitButton.background = "#2acaea";
    testSubmitButton.fontSize = 50;
    testSubmitButton.borderColor = "black";
    testSubmitButton.cornerRadius = 20;
    testSubmitButton.width = "80%";
    testSubmitButton.paddingBottom = "10px";
    testSubmitButton.onPointerUpObservable.add(() => {

        let success = false;

        let windowResponseMesh = null;

        if(selected_answer === null) {
            windowResponseMesh = createWindow(heigh, width, "Advertencia", "Debes seleccionar una respuesta", false, scene);
        } else if(selected_answer === correct_answer) {
            windowResponseMesh = createWindow(heigh, width, "Exito", correct_message, false, scene);
            success = true;
        } else {
            windowResponseMesh = createWindow(heigh, width, "Error", incorrect_message, false, scene);
        }

        linkMeshes(testMesh, windowResponseMesh);

        setTimeout(() => {
            windowResponseMesh.dispose();

            if(success) {
                testMesh.dispose();
                barMesh.dispose();
            }

        }, 2000);

    });

    testGrid.addControl(testText, 0, 0);
    testGrid.addControl(testAnswersGrid, 1, 0);
    testGrid.addControl(testSubmitButton, 2, 0);

    testRectangle.addControl(testGrid);
    testTexture.addControl(testRectangle);

    linkMeshes(testMesh, barMesh, LINKED_UP);

    return testMesh;

}

/**
 * Creates a new image texture from the given URL.
 * @param {string} url - The URL of the image.
 * @param {BABYLON.Scene} scene - The scene in which the texture will be used.
 * @returns {Promise<BABYLON.Texture>} - A promise that resolves to the created texture.
 */
async function createImage(url, scene) {
    const texture = new BABYLON.Texture(url, scene);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return texture;
}

/**
 * 
 * @param {number} heigh - Altura de la ventana en pixeles
 * @param {number} width - Ancho de la ventana en pixeles
 * @param {string} title - Titulo de la ventana
 * @param {string} url  - URL del video de youtube
 * @returns {BABYLON.Mesh} - Malla del video
 */
function createVideo(heigh, width, title, url, scene) {

    const videoMesh = BABYLON.MeshBuilder.CreatePlane(`videoMesh_${title}`, {
        height: heigh * 0.01, 
        width: width * 0.01, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    const videoMaterial = new BABYLON.StandardMaterial(`videoMaterial_${title}`, scene);
    videoMaterial.diffuseColor = BABYLON.Color3.White();

    const videoTexture = new BABYLON.VideoTexture(`videoTexture_${title}`, url, scene, true, false, BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE, {
        loop: false,
        autoPlay: false,
        muted: true,
        autoUpdateTexture: true,
        crossOrigin: "anonymous"
    });

    videoTexture.onLoadObservable.add(() => {

        const barMesh = createBar(width, heigh, title, scene);

        videoMaterial.diffuseTexture = videoTexture;
        videoMaterial.roughness = 1;
        videoMaterial.emissiveColor = BABYLON.Color3.White();
    
        videoMesh.material = videoMaterial;
        videoMesh.xrPickable = true;
    
        const controls = createControls(width, heigh, videoMesh, videoTexture, scene);
    
        linkMeshes(videoMesh, barMesh, LINKED_UP);
        linkMeshes(videoMesh, controls, LINKED_DOWN);
    
        
    });
    
    return videoMesh;

}

/**
 * Creates an audio object with the specified parameters.
 * @param {string} name - The name of the audio object.
 * @param {string} url - The URL of the audio file.
 * @param {BABYLON.Scene} scene - The scene in which the audio object will be created.
 * @param {boolean} autoPlay - Determines whether the audio should start playing automatically.
 * @param {boolean} loop - Determines whether the audio should loop.
 * @param {boolean} spatialSound - Determines whether the audio should be treated as spatial sound.
 * @param {number} maxDistance - The maximum distance at which the audio can be heard.
 * @returns {Promise<BABYLON.Sound>} A promise that resolves with the created audio object.
 */
async function createAudio(name, url, scene, autoPlay, loop, spatialSound, maxDistance) {
    return new Promise((resolve, reject) => {
        const options = {
            autoplay: autoPlay,
            loop: loop,
            spatialSound: spatialSound,
            maxDistance: maxDistance
        };

        const sound = new BABYLON.Sound(name, url, scene, () => {
            resolve(sound);
        }, options);
    });
}

/**
 * Creates an XR experience with the given ground, skybox, and scene.
 * @param {BABYLON.AbstractMesh} ground - The ground mesh for the XR experience.
 * @param {BABYLON.AbstractMesh} skybox - The skybox mesh for the XR experience.
 * @param {BABYLON.Scene} scene - The scene in which the XR experience will be created.
 * @returns {Promise<[BABYLON.WebXRExperienceHelper, GUI.Button]>} A promise that resolves to an array containing the XR experience helper and the XR mode button.
 */
async function createXR(ground, skybox, scene) {

    let avaliableVR = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr")
    let avaliableAR = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")

    let xr = null;
    let inmersive_state = "inline"
    let reference_floor = "local-floor"

    if (avaliableVR) {

        inmersive_state = "immersive-vr"

        if (avaliableAR) {

            inmersive_state = "immersive-ar"

        }

    }

    var advancedTextureFullScreen = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

    var btnModoXR = GUI.Button.CreateSimpleButton("btnModoXR", "Entrar a modo AR")
    btnModoXR.width = "40%"
    btnModoXR.height = "10%"
    btnModoXR.cornerRadius = 20;
    btnModoXR.color = "white";
    btnModoXR.thickness = 4;
    btnModoXR.background = "black";
    btnModoXR.alpha = 0.5;

    if(!avaliableAR || !avaliableVR) {

        btnModoXR.textBlock.text = "Experiencia XR no compatible"

    } else {

        btnModoXR.onPointerEnterObservable.add(function () {
            btnModoXR.background = "white";
            btnModoXR.color = "black";
        });
        btnModoXR.onPointerOutObservable.add(function () {
            btnModoXR.background = "black";
            btnModoXR.color = "white";
        });

        if(!ground || !skybox) {

            const env = scene.createDefaultEnvironment();
    
            ground = !ground ? env.ground : ground;
            skybox = !skybox ? env.skybox : skybox;
    
        }
    
        const xr = await scene.createDefaultXRExperienceAsync({
    
            disableDefaultUI: true,
            disableNearInteraction: true,
            disablePointerSelection: false,
            disableTeleportation: true,
            optionalFeatures: true,
    
            floorMeshes: [ground],
    
            uiOptions: {
    
                sessionMode: inmersive_state,
                referenceSpaceType: reference_floor
    
            },
    
            inputOptions: {
            
                doNotLoadControllerMeshes: false,
            
            }
    
        })
    
        xr.baseExperience.onStateChangedObservable.add((XRstate) => {
    
            if (avaliableVR) {
    
                switch (XRstate) {
    
                    case BABYLON.WebXRState.IN_XR:
                        // XR is initialized and already submitted one frame
                    break
                    case BABYLON.WebXRState.ENTERING_XR:
                        // xr is being initialized, enter XR request was made
                    break
                    case BABYLON.WebXRState.EXITING_XR:
                        // xr exit request was made. not yet done.
                    break
                    case BABYLON.WebXRState.NOT_IN_XR:
                        // self explanatory - either out or not yet in XR
                    break
    
                }
    
            }
    
            if (avaliableAR) {
    
                switch (XRstate) {
    
                    case BABYLON.WebXRState.IN_XR:
                        // XR is initialized and already submitted one frame
                    break
                    case BABYLON.WebXRState.ENTERING_XR:
                        // xr is being initialized, enter XR request was made
                        if (ground) {
    
                            ground.visibility = 0
    
                        }
    
                        if (skybox) {
    
                            skybox.isVisible = false
    
                        }
    
                    break
                    case BABYLON.WebXRState.EXITING_XR:
                        // xr exit request was made. not yet done.
                    break
                    case BABYLON.WebXRState.NOT_IN_XR:
                        // self explanatory - either out or not yet in XR
                        if (ground) {
    
                            ground.visibility = 1
    
                        }
    
                        if (skybox) {
    
                            skybox.isVisible = true
    
                        }
                        
                    break
    
                }
    
            }
    
        })
    
        btnModoXR.onPointerUpObservable.add(function () {
    
            if (xr.baseExperience.state === BABYLON.WebXRState.NOT_IN_XR) {
    
                xr.baseExperience.enterXRAsync(inmersive_state, reference_floor)
                btnModoXR.textBlock.text = "Entrar a modo VR"
    
            } else if (xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
    
                xr.baseExperience.exitXRAsync()
                btnModoXR.textBlock.text = "Entrar a modo AR"
    
            }
    
        });

    }
    btnModoXR.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
    btnModoXR.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM

    advancedTextureFullScreen.addControl(btnModoXR)

    return [xr, btnModoXR]

}

export { createWindow, createTest, createVideo, createXR, createAudio, createImage };
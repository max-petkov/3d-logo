import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';


function Logo() {
    this.canvas = document.querySelector("canvas");
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.gltf = null;
    this.parts = null;
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.fov = 2;
    this.loaded = false;
    this.clicked = false;
  }
  
  Logo.prototype.createScene = function () {
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xffffff);
    // this.scene.add(new THREE.GridHelper(20, 20));
  };
  
  Logo.prototype.createCamera = function () {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.size.width / this.size.height
    );

    this.camera.position.y = 4;
  };
  
  Logo.prototype.createModel = function () {
    const loader = new GLTFLoader();

    loader.load("./sv-logo.glb", 
    (gltf) => {
        this.loaded = true;
        this.gltf = gltf;
        this.parts = this.gltf.scene.children;

        this.parts.forEach((part, i) => {
            part.position.x = -0.023;
            
            part.rotation.set((Math.random()*i), Math.random()*i, Math.random()*i);
            part.scale.set(0, 0, 0);
        });
        
        this.scene.add(this.gltf.scene);
        this.renderer.render(this.scene, this.camera);
        this.canvas.click();
    },
	( xhr ) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
	( err ) => console.log( 'An error happened: ', err),
    );
  };
  
  Logo.prototype.createRenderer = function () {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.render(this.scene, this.camera);
  };
  
  Logo.prototype.resize = function () {
    let ww = window.innerWidth;
  
    window.addEventListener("resize", () => {
      if (ww !== window.innerWidth) {
        ww = window.innerWidth;
  
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;
        this.renderer.setSize(this.size.width, this.size.height);
        this.camera.aspect = this.size.width / this.size.height;
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
      }
    });
  };
  
  Logo.prototype.createControls = function () {
    this.controls = new OrbitControls(this.camera, this.canvas);
  };
  
  Logo.prototype.animate = function () {
    gsap.ticker.add((time) => {
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
    });
  };

  Logo.prototype.createLight = function() {
    const ambientLight = new THREE.AmbientLight( 0x404040 );
    this.scene.add( ambientLight );

    const directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
    directionalLight.position.set(10, 20, 20)
    this.scene.add( directionalLight );

    const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );
    // this.scene.add( directionalLightHelper );
  }

  Logo.prototype.events = function() {
    this.canvas.addEventListener("click", () => {
        
        if(this.clicked) return;
        const duration = 2;
        for (let i = 0; i < this.parts.length; i++) {
            gsap.to(this.parts[i].rotation, {
                x: 0,
                y: 0, 
                z: 0,
                ease: Power3.easeInOut,
                duration: duration,
                onStart: () => this.clicked = true
            });

            gsap.to(this.parts[i].scale, {
                x: 1,
                y: 1, 
                z: 1,
                ease: Back.easeOut.config(1.1),
                duration: duration,
            });
        }

        gsap.to(this.camera.position, {
            y: 1.5,
            duration: duration - 1,
            ease: Power2.easeInOut
        })
    });
  }
  
  
  Logo.prototype.createGUI = function() {
    const gui = new GUI();
    const bloomFolder = gui.addFolder( 'Bloom' );
    const toneMappingFolder = gui.addFolder( 'Tone Mapping' );
  
    bloomFolder
    .add( this.unrealBloomPass, 'threshold', 0.0, 5 )
    .onChange( ( value ) => this.unrealBloomPass.threshold = Number( value ));
  
    bloomFolder
    .add( this.unrealBloomPass, 'strength', 0.0, 5 )
    .onChange( ( value ) => this.unrealBloomPass.strength = Number( value ));
  
    bloomFolder
    .add( this.unrealBloomPass, 'radius', 0.0, 5 )
    .onChange( ( value ) => this.unrealBloomPass.radius = Number( value ));
  
    toneMappingFolder
    .add( this.renderer, 'toneMappingExposure', 0.0, 5 )
    .onChange( ( value ) => this.renderer.radius = Number( value ));
  }
  
  
  Logo.prototype.init = function () {
    this.createScene();
    this.createCamera();
    this.createModel();
    this.createRenderer();
    this.createControls();
    // this.createGUI();
    this.createLight();
    this.resize();
    this.animate();
    this.events();
  };
  
  new Logo().init();
  
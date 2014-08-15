/* global Backbone, THREE, $, Stats, requestAnimationFrame */
'use strict';

var App, Objects;

var AppView = Backbone.View.extend({
    el: 'body',

    events: {
        'change input' : 'settingsChanged'
    },

    initialize: function() {
        var self = this;
        this.width = $('#world').width();
        this.height = $('#world').width();
        this.windowHalfX = this.width / 2;
        this.windowHalfY = this.height / 2;
        this.objects = {};
        this.container = $('#world').get(0);

        this.camera = new THREE.PerspectiveCamera( 60, this.width /this.height, 1, 2000 );
        this.camera.position.z = 500;

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.camera.lookAt(this.scene.position);
        this.group = new THREE.Object3D();
        this.scene.add( this.group );

        // earth

        var loader = new THREE.TextureLoader();
        loader.load( 'images/land_ocean_ice_cloud_2048.jpg', function ( texture ) {
            self.WorldGeometry = new THREE.SphereGeometry( 200, 20, 20 );
            self.WorldGeometry.mergeVertices();
            //self.WorldGeometry.computeCentroids();
            var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            self.WorldMesh = new THREE.Mesh( self.WorldGeometry, material );
            self.WorldMesh.position.set(0,0,0);
            self.group.add( self.WorldMesh );

            self.worldLoaded();
        } );

        // shadow

        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );
        gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
        gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;

        var geometry = new THREE.PlaneGeometry( 300, 300, 3, 3 );
        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.y = - 200;
        mesh.rotation.x = - Math.PI / 2;
        this.group.add( mesh );

        this.renderer = new THREE.WebGLRenderer( {antialias:true} );//new THREE.CanvasRenderer();
        this.renderer.setClearColor( 0xffffff );
        this.renderer.setSize(this.width, this.height );
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        this.container.appendChild( this.renderer.domElement );



        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild( this.stats.domElement );

        $(window).resize(this.resize);

        this.animate();

    },

    addPlane: function(obj) {
        var self = this;

        /*var loader = new THREE.TextureLoader();
        loader.load( spriteobj.image, function ( texture ) {
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: false
                //, rotation: Math.PI / 2
            });
            self.sprites[spriteobj.label] = new THREE.Sprite( spriteMaterial );
            self.sprites[spriteobj.label].scale.set(50,50,50);
            self.sprites[spriteobj.label].position = self.WorldGeometry.vertices[spriteobj.vertice].clone().multiplyScalar(1.1);
            //self.sprites[spriteobj.label].rotation.y = - 200;
            self.group.add( self.sprites[spriteobj.label] );
        });*/

        var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
            map:THREE.ImageUtils.loadTexture(obj.image)
        });
        img.map.needsUpdate = true; //ADDED
        img.transparent = true;

        // plane
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(obj.w, obj.h),img);
        var vertice = this.getRand(obj.vertice[0], obj.vertice[1]);
        plane.overdraw = true;
        plane.material.side = THREE.DoubleSide;
        plane.position = self.WorldGeometry.vertices[vertice].clone().multiplyScalar(1.1);
        //plane.rotation.y =   - Math.PI / 6;
        this.objects[obj.label] = plane;
        self.group.add(this.objects[obj.label]);

    },

    resize: function() {
        this.width = $('#world').width();
        this.height = $('#world').width();
        this.windowHalfX = this.width / 2;
        this.windowHalfY = this.height / 2;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.width, this.height );
    },

    animate: function() {
        var self = this;
        requestAnimationFrame( function(){
            self.animate();
        });

        this.render();
        this.controls.update();
        this.stats.update();
    },

    render: function() {
        /*this.camera.position.x += ( mouseX -  this.camera.position.x ) * 0.05;
        this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
        this.camera.lookAt( this.scene.position );*/
        this.group.rotation.y -= 0.005;

        this.renderer.render( this.scene, this.camera );
    },

    worldLoaded: function() {
        //this.addPlane(Objects.travel[0]);
        //this.addPlane(Objects.sports[0]);
    },

    settingsChanged: function(e) {
        var $range  = $(e.target),
            group   = $range.prop('name'),
            value   = $range.val();

        console.log('Settings changed', $range.prop('name'));

        $('#'+$range.data('value')).text($range.val());

        this.clearPlanes(group);
        this.addPlanes(group, value);
    },

    clearPlanes: function(group) {
        var obj;
        for ( var i in Objects[group] ) {
            obj = Objects[group][i];
            this.group.remove(this.objects[obj.label]);
            delete this.objects[obj.label];
        }
    },

    addPlanes: function(group, value) {
        var i = 1;
        for (var label in Objects[group]) {
            if (i > value) {
                break;
            }

            this.addPlane(Objects[group][label]);
            i++;
        }
    },

    getRand: function(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    }
});

Objects = {
    'travel': [
        {
            label: 'eiffel',
            image: 'images/eiffel.png',
            vertice: [0, 250],
            w: 50,
            h: 50
        },
        {
            label: 'sagrada',
            image: 'images/sagrada-familia.png',
            vertice: [0, 250],
            w: 50,
            h: 50
        },
        {
            label: 'pyramid',
            image: 'images/pyramid.png',
            vertice: [0, 250],
            w: 50,
            h: 50
        },
        {
            label: 'liberty',
            image: 'images/liberty.png',
            vertice: [0, 250],
            w: 50,
            h: 50
        },
        {
            label: 'bigben',
            image: 'images/big-ben.png',
            vertice: [0, 250],
            w: 50,
            h: 50
        }
    ],
    'sports': [
        {
            label: 'football',
            image: 'images/ball.png',
            vertice: [150, 350],
            w: 50,
            h: 50
        },
        {
            label: 'basketball',
            image: 'images/basketball.png',
            vertice: [150, 350],
            w: 50,
            h: 50
        },
        {
            label: 'baseball',
            image: 'images/baseball.gif',
            vertice: [150, 350],
            w: 50,
            h: 50
        },
        {
            label: 'golf',
            image: 'images/golf.png',
            vertice: [150, 350],
            w: 50,
            h: 50
        },
        {
            label: 'tennis',
            image: 'images/tennis.png',
            vertice: [150, 350],
            w: 50,
            h: 50
        }
    ]
};

$(function() {
    App = new AppView();
});

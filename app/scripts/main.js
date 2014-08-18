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

        this.loader = new THREE.TextureLoader();
        this.loader.load( 'images/land_ocean_ice_cloud_2048.jpg', function ( texture ) {
            self.WorldGeometry = new THREE.SphereGeometry( 200, 20, 20 );
            self.WorldGeometry.mergeVertices();
            //self.WorldGeometry.computeCentroids();
            var material = new THREE.MeshLambertMaterial( { map: texture, overdraw: 0.5 } );
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

        //Lights

        var ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // directional lighting
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        //directionalLight.position.set(1, 1, 1).normalize();
        directionalLight.position = this.camera.position;
        this.scene.add(directionalLight);

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild( this.stats.domElement );

        $(window).resize(this.resize);

        this.animate();

    },

    addObject: function(obj) {
        var self = this;
        this.loader.load(obj.image, function ( texture ) {
            switch (obj.geometry) {
                case 'sphere':
                    var geometry = new THREE.SphereGeometry( obj.w, obj.w/2, obj.w/2 );
                    break;
                default:
                    var geometry = new THREE.CubeGeometry( obj.h, obj.w, obj.w );
                    break;
            }
            var material = new THREE.MeshLambertMaterial( { map: texture, overdraw: 0.5 } );
            var mesh = new THREE.Mesh( geometry, material );
            var vertice = self.getRand(obj.vertice[0], obj.vertice[1]);
            mesh.position = self.WorldGeometry.vertices[vertice].clone().multiplyScalar(1.1);
            self.objects[obj.label] = mesh;
            self.group.add( mesh );
        });
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

        this.clearObjects(group);
        this.addObjects(group, value);
    },

    clearObjects: function(group) {
        var obj;
        for ( var i in Objects[group] ) {
            obj = Objects[group][i];
            this.group.remove(this.objects[obj.label]);
            delete this.objects[obj.label];
        }
    },

    addObjects: function(group, value) {
        var i = 1, obj;
        for (var label in Objects[group]) {
            if (i > value) {
                break;
            }
            this.addObject( Objects[group][label]);
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
            vertice: [0, 200],
            geometry: 'plane',
            w: 40,
            h: 40
        },
        {
            label: 'sagrada',
            image: 'images/sagrada-familia.png',
            vertice: [0, 200],
            geometry: 'plane',
            w: 40,
            h: 40
        },
        {
            label: 'pyramid',
            image: 'images/pyramid.png',
            vertice: [0, 200],
            geometry: 'plane',
            w: 40,
            h: 40
        },
        {
            label: 'liberty',
            image: 'images/liberty.png',
            vertice: [0, 200],
            geometry: 'plane',
            w: 40,
            h: 40
        },
        {
            label: 'bigben',
            image: 'images/big-ben.png',
            vertice: [0, 200],
            geometry: 'plane',
            w: 40,
            h: 40
        }
    ],
    'sports': [
        {
            label: 'football',
            image: 'images/football_texture.png',
            vertice: [200, 300],
            geometry: 'sphere',
            w: 40,
            h: 20
        },
        {
            label: 'basketball',
            image: 'images/basketball_texture.jpg',
            vertice: [200, 300],
            geometry: 'sphere',
            w: 40,
            h: 20
        },
        {
            label: 'baseball',
            image: 'images/baseball_texture.jpg',
            vertice: [200, 300],
            geometry: 'sphere',
            w: 40,
            h: 20
        },
        {
            label: 'golf',
            image: 'images/golf_texture.jpg',
            vertice: [200, 300],
            geometry: 'sphere',
            w: 40,
            h: 20
        },
        {
            label: 'tennis',
            image: 'images/tennis_texture.jpg',
            vertice: [200, 300],
            geometry: 'sphere',
            w: 40,
            h: 20
        }
    ]
};

$(function() {
    App = new AppView();
});

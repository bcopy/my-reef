AFRAME.registerComponent('ocean-shader', {
    schema: {
      waterColor: {type: 'color', default: '#0000FF'},
      foamColor: {type: 'color', default: '#00FCFF'},
      waveHeight: {type: 'number', default: 0.005},
      colorStrength: {type: 'number', default: 0.05, min: 0, max: 1}
    },

    init: function () {
      this.el.addEventListener('model-loaded', this.updateMaterial.bind(this));
    },

    updateMaterial: function () {
      const mesh = this.el.getObject3D('mesh');
      const data = this.data;

      if (mesh) {
        mesh.traverse((node) => {
          if (node.isMesh) {
            const newMaterial = new THREE.ShaderMaterial({
              uniforms: {
                baseTexture: { value: node.material.map },
                waterColor: { value: new THREE.Color(data.waterColor) },
                foamColor: { value: new THREE.Color(data.foamColor) },
                waveHeight: { value: data.waveHeight },
                colorStrength: { value: data.colorStrength },
                time: { value: 0 }
              },
              vertexShader: `
                uniform float time;
                uniform float waveHeight;
                varying vec2 vUv;
                varying float vWaveHeight;
                
                #include <skinning_pars_vertex>
                
                void main() {
                  vUv = uv;
                  
                  #include <skinbase_vertex>
                  
                  // Transform position first
                  vec3 transformed = vec3(position);
                  #include <skinning_vertex>
                  
                  // Apply wave effect after skinning
                  float waveEffect = sin(transformed.x * 10.0 + time) * cos(transformed.z * 10.0 + time) * waveHeight;
                  transformed.y += waveEffect;
                  vWaveHeight = waveEffect;
                  
                  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
                  gl_Position = projectionMatrix * mvPosition;
                }
              `,
              fragmentShader: `
                uniform sampler2D baseTexture;
                uniform vec3 waterColor;
                uniform vec3 foamColor;
                uniform float colorStrength;
                varying vec2 vUv;
                varying float vWaveHeight;
                
                void main() {
                  vec4 texColor = texture2D(baseTexture, vUv);
                  
                  vec3 finalColor = mix(waterColor, foamColor, smoothstep(0.0, 0.5, vWaveHeight + 0.5));
                  
                  gl_FragColor = vec4(mix(texColor.rgb, finalColor, colorStrength), texColor.a);
                }
              `,
              skinning: true,
              transparent: true
            });

            // Preserve original material properties
            newMaterial.side = node.material.side;
            newMaterial.shadowSide = node.material.shadowSide;
            newMaterial.vertexColors = node.material.vertexColors;
            newMaterial.flatShading = node.material.flatShading;

            node.material = newMaterial;
          }
        });
      }
    },

    tick: function (time) {
      const mesh = this.el.getObject3D('mesh');
      if (mesh) {
        mesh.traverse((node) => {
          if (node.isMesh && node.material.uniforms) {
            node.material.uniforms.time.value = time * 0.001;
          }
        });
      }
    }
  });

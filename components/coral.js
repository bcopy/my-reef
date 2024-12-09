

// List of valid coral species from your homie device hierarchy
const VALID_SPECIES = [
  'acropora-cervicornis',
  'acropora-palmata',
  'acropora-prolifera',
  'agaricia-speciosa',
  'colpophyllia-natans',
  'dendrogyra-cylindricus',
  'diploria-labyrinthiformis',
  'eusmilia-fastigiata',
  'gorgona-ventalina',
  'meandrina-meandrites',
  'millepora-alcicornis',
  'montastrea-cavernosa',
  'orbicella-curta',
  'porites-lobata',
  'pseudodiploria-strigosa'
];

AFRAME.registerComponent('coral', {
  schema: {
    species: { 
      type: 'string', 
      default: 'acropora-cervicornis',
      oneOf: VALID_SPECIES
    },
    health: { type: 'number', default: 100 },
    bleaching: { type: 'number', default: 0 },
    growthIndex: { type: 'number', default: 1.0 },
    color: { type: 'color', default: '#00FCFF' },
    waterColor: { type: 'color', default: '#0000FF' },
    waveHeight: { type: 'number', default: 0.005 },
    colorStrength: { type: 'number', default: 0.05, min: 0, max: 1}
  },

  init: function() {
    log.info('Initializing coral component:', {
      species: this.data.species,
      position: this.el.getAttribute('position'),
      scale: this.el.getAttribute('scale'),
      growthIndex: this.data.growthIndex
    });

    // Create model entity
    this.modelEl = document.createElement('a-entity');
    
    // Reference the preloaded asset using the species name
    this.modelEl.setAttribute('gltf-model', `#coral-${this.data.species}`);
    
    // Add the ocean shader component
    this.modelEl.setAttribute('ocean-shader', {
      waterColor: '#0000FF',
      color: this.data.color,
      waveHeight: 0.005,
      colorStrength: this.data.colorStrength
    });

    this.el.appendChild(this.modelEl);

    // Set initial scale based on growth index
    this.updateScale();

    // Add event listener for model loading
    this.modelEl.addEventListener('model-loaded', () => {
      log.debug('Coral model loaded:', {
        species: this.data.species,
        growthIndex: this.data.growthIndex
      });
      this.updateCoralAppearance();
    });

    // Add event listener for model loading errors
    this.modelEl.addEventListener('model-error', (error) => {
      log.error('Error loading coral model:', {
        species: this.data.species,
        error: error
      });
    });
  },

  update: function(oldData) {
    const changedProps = Object.keys(this.data).filter(key => this.data[key] !== oldData[key]);
    
    if (changedProps.length > 0) {
      log.debug('Coral properties updated:', {
        species: this.data.species,
        changedProps: changedProps,
        growthIndex: this.data.growthIndex
      });
      
      if (changedProps.includes('species')) {
        // Species changed, update model reference
        this.modelEl.setAttribute('gltf-model', `#coral-${this.data.species}`);
      }
      
      if (changedProps.includes('growthIndex')) {
        this.updateScale();
      }
      
      this.updateCoralAppearance();
    }
  },

  updateScale: function() {
    // Validate and apply growth index to scale
    const scale = this.validateGrowthIndex(this.data.growthIndex);
    
    log.debug('Updating coral scale:', {
      originalGrowthIndex: this.data.growthIndex,
      appliedScale: scale
    });
    
    // Apply scale to the model entity, not the container entity
    this.modelEl.object3D.scale.set(scale, scale, scale);
  },

  validateGrowthIndex: function(growthIndex) {
    const min = 0.1;
    const max = 5.0;
    const validated = Math.max(min, Math.min(max, parseFloat(growthIndex) || 1.0));
    
    if (validated !== growthIndex) {
      log.warn(`Growth index ${growthIndex} was clamped to ${validated}`);
    }
    
    return validated;
  },

  updateCoralAppearance: function() {
    // Update ocean shader parameters based on coral health and bleaching
    const bleachingFactor = this.data.bleaching / 100;
    const healthFactor = this.data.health / 100;

    // Adjust shader parameters based on coral health
    this.modelEl.setAttribute('ocean-shader', {
      colorStrength: Math.max(0.05, bleachingFactor), // More bleaching = stronger white color
      waveHeight: 0.005 * healthFactor // Less healthy = less movement
    });
  },

  remove: function() {
    log.info('Removing coral component:', {
      species: this.data.species,
      growthIndex: this.data.growthIndex
    });
  }
});

// Register coral primitive
AFRAME.registerPrimitive('a-coral', {
  defaultComponents: {
    coral: {}
  },

  mappings: {
    species: 'coral.species',
    health: 'coral.health',
    bleaching: 'coral.bleaching',
    growth: 'coral.growthIndex',
    color: 'coral.color',
    watercolor: 'coral.waterColor',
    waveheight: 'coral.waveHeight',
    colorstrength: 'coral.colorStrength'
  }
});
import * as tf from '@tensorflow/tfjs';

export const loadPhysicsModel = async () => {
  try {
    // Load the model from the pickle file
    const model = await tf.loadLayersModel('file://src/components/physics2_knowledge_base.pkl');
    return model;
  } catch (error) {
    console.error('Error loading physics model:', error);
    throw error;
  }
};

export const predictPhysics = async (model, input) => {
  try {
    if (!model) {
      throw new Error('Model not loaded');
    }
    const prediction = await model.predict(input);
    return prediction;
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
}; 
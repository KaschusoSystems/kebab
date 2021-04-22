module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'kebab',
  etaEnv: {
    kaschuso: process.env.KASCHUSO_BASE_URL || 'https://kaschuso.so.ch/',
    gyros: process.env.GYROS_BASE_URL || 'http://localhost/',
    colors: {
        insufficient: '#EF476F',
        sufficient: '#FFD166',
        good: '#06D6A0'
    }
  }
};

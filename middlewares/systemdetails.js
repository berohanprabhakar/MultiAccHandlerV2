const os = require('os');
const { networkInterfaces } = os;

// Get Local IP
const getLocalIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return '127.0.0.1';
  };
  
  // Get MAC Address
  const getMacAddress = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.mac;
        }
      }
    }
    return '00:00:00:00:00:00';
  };

  module.exports = {getLocalIP, getMacAddress};
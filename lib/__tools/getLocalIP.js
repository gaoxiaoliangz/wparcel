import os from 'os'

const getLocalIP = () => {
  let IPv4
  const network = os.networkInterfaces()

  if (!network.en0) {
    return 'localhost'
  }

  for (let i = 0; i < network.en0.length; i++) {
    if (os.networkInterfaces().en0[i].family === 'IPv4') {
      IPv4 = os.networkInterfaces().en0[i].address
    }
  }

  return IPv4
}

export default getLocalIP

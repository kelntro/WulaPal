const { Mutex } = require('async-mutex');

const walletMutex = new Mutex();

const queueWalletTransaction = async (fn) => {
  const release = await walletMutex.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
};

module.exports = { queueWalletTransaction };

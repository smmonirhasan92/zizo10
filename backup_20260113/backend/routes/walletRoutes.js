const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/transfer/game', authMiddleware, walletController.transferToGame);
router.post('/withdraw-game', authMiddleware, walletController.withdrawGameFunds);
router.post('/transfer/main', authMiddleware, walletController.transferToMain);
router.post('/transfer/purchase', authMiddleware, walletController.transferToPurchase);
router.post('/load-purchase', authMiddleware, walletController.loadPurchaseWallet);
// router.post('/load-purchase', authMiddleware, walletController.loadPurchaseWallet); // Removed duplicate

// P2P Transfer (Zizo 10 v2.0)
router.post('/transfer', authMiddleware, walletController.transferMoney);

router.get('/balance', authMiddleware, walletController.getBalance);
router.post('/recharge', authMiddleware, upload.single('proofImage'), walletController.requestRecharge);

// router.post('/activate', authMiddleware, upload.single('kycImage'), walletController.activateWallet);

module.exports = router;

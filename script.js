document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('avatarCanvas');
    const ctx = canvas.getContext('2d');

    // 启用图像平滑处理
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Load default avatar frame with error handling
    const avatarFrame = new Image();
    avatarFrame.src = './assets/avatarFrame1.PNG';
    avatarFrame.onload = () => {
        ctx.drawImage(avatarFrame, 0, 0, canvas.width, canvas.height);
    };
    avatarFrame.onerror = () => {
        console.error('Failed to load avatar frame image');
    };

    let profileImage;

    // Handle profile image upload
    const profileImageInput = document.getElementById('profileImageInput');
    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                profileImage = img;
                drawProfileImage();
            };
        }
    });

    // Draw profile image on canvas
    function drawProfileImage() {
        if (profileImage) {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制头像
            ctx.drawImage(profileImage, profilePosition.x - profileImage.width * profileScale * 0.5, profilePosition.y - profileImage.height * profileScale * 0.5, profileImage.width * profileScale, profileImage.height * profileScale);

            // 绘制框架
            ctx.drawImage(avatarFrame, 0, 0, canvas.width, canvas.height);

            // 绘制挂件
            drawAccessories();
        } else {
            console.error('Profile image is not loaded');
        }
    }

    let profilePosition = { x: canvas.width / 2, y: canvas.height / 2 };
    let profileScale = 1;

    const avatarPositionXInput = document.getElementById('avatarPositionX');
    const avatarPositionYInput = document.getElementById('avatarPositionY');
    const avatarScaleInput = document.getElementById('avatarScale');

    avatarPositionXInput.addEventListener('input', updateProfilePosition);
    avatarPositionYInput.addEventListener('input', updateProfilePosition);
    avatarScaleInput.addEventListener('input', updateProfileScale);

    function updateProfilePosition() {
        profilePosition.x = parseInt(avatarPositionXInput.value);
        profilePosition.y = parseInt(avatarPositionYInput.value);

        drawProfileImage();
    }

    function updateProfileScale() {
        profileScale = parseFloat(avatarScaleInput.value);

        drawProfileImage();
    }

    let accessories = [];

    // Handle accessory upload and drawing
    const accessoryInput = document.getElementById('accessoryInput');
    accessoryInput.addEventListener('change', (event) => {
        const files = event.target.files;
        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const img = new Image();
            img.src = URL.createObjectURL(files[i]);
            img.onload = () => {
                accessories.push({ img, x: 512, y: 512, scale: 1 });
                drawAccessories();
                addAccessoryThumbnail(img);
            };
        }
    });

    // Draw accessories on canvas with drag and scale functionality
    function drawAccessories() {
        console.log('Accessories array:', accessories); // 添加调试信息
        // 先清除挂件区域
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 重新绘制头像和框架
        if (profileImage) {
            ctx.drawImage(profileImage, profilePosition.x - profileImage.width * profileScale * 0.5, profilePosition.y - profileImage.height * profileScale * 0.5, profileImage.width * profileScale, profileImage.height * profileScale);
        }
        ctx.drawImage(avatarFrame, 0, 0, canvas.width, canvas.height);

        // 绘制所有挂件
        accessories.forEach((accessory) => {
            ctx.drawImage(accessory.img, accessory.x - accessory.img.width * accessory.scale * 0.25, accessory.y - accessory.img.height * accessory.scale * 0.25, accessory.img.width * accessory.scale * 0.5, accessory.img.height * accessory.scale * 0.5);
        });

        // 绘制选中的挂件
        const selectedAccessoryImg = document.querySelector('.selected-thumbnail-img');
        if (selectedAccessoryImg) {
            const img = new Image();
            img.src = selectedAccessoryImg.src;
            img.onload = () => {
                // 清除选中的挂件所占的区域，而不是清空整个画布
                ctx.clearRect(selectedAccessoryPosition.x - img.width * selectedAccessoryScale * 0.25, selectedAccessoryPosition.y - img.height * selectedAccessoryScale * 0.25, img.width * selectedAccessoryScale * 0.5, img.height * selectedAccessoryScale * 0.5);
                ctx.drawImage(img, selectedAccessoryPosition.x - img.width * selectedAccessoryScale * 0.25, selectedAccessoryPosition.y - img.height * selectedAccessoryScale * 0.25, img.width * selectedAccessoryScale * 0.5, img.height * selectedAccessoryScale * 0.5);
            };
        }
    }

    // Add accessory thumbnail to the list
    function addAccessoryThumbnail(img) {
        const thumbnailList = document.getElementById('accessoryThumbnails');
        const thumbnail = document.createElement('img');
        thumbnail.src = img.src;
        thumbnail.classList.add('thumbnail');
        thumbnail.addEventListener('click', () => {
            selectAccessory(thumbnail);
        });
        thumbnailList.appendChild(thumbnail);
    }

    // Select accessory thumbnail
    function selectAccessory(thumbnail) {
        const selectedAccessory = document.getElementById('selectedAccessory');
        selectedAccessory.innerHTML = ''; // Clear previous selection
        const selectedImg = document.createElement('img');
        selectedImg.src = thumbnail.src;
        selectedImg.classList.add('selected-thumbnail-img');
        selectedAccessory.appendChild(selectedImg);

        // Find the selected accessory in the accessories array
        const selectedAccessoryData = accessories.find(accessory => accessory.img.src === thumbnail.src);
        if (selectedAccessoryData) {
            selectedAccessoryPosition.x = selectedAccessoryData.x;
            selectedAccessoryPosition.y = selectedAccessoryData.y;
            selectedAccessoryScale = selectedAccessoryData.scale;

            // Update the input values
            positionXInput.value = selectedAccessoryPosition.x;
            positionYInput.value = selectedAccessoryPosition.y;
            scaleInput.value = selectedAccessoryScale;
        }
    }

    let selectedAccessoryPosition = { x: 512, y: 512 };
    let selectedAccessoryScale = 1;

    const positionXInput = document.getElementById('accessoryPositionX');
    const positionYInput = document.getElementById('accessoryPositionY');
    const scaleInput = document.getElementById('accessoryScale');

    positionXInput.addEventListener('input', updateSelectedAccessoryPosition);
    positionYInput.addEventListener('input', updateSelectedAccessoryPosition);
    scaleInput.addEventListener('input', updateSelectedAccessoryScale);

    function updateSelectedAccessoryPosition() {
        selectedAccessoryPosition.x = parseInt(positionXInput.value);
        selectedAccessoryPosition.y = parseInt(positionYInput.value);

        // Find the selected accessory in the accessories array and update its position
        const selectedAccessoryData = accessories.find(accessory => accessory.img.src === document.querySelector('.selected-thumbnail-img').src);
        if (selectedAccessoryData) {
            selectedAccessoryData.x = selectedAccessoryPosition.x;
            selectedAccessoryData.y = selectedAccessoryPosition.y;
        }

        drawAccessories();
    }

    function updateSelectedAccessoryScale() {
        selectedAccessoryScale = parseFloat(scaleInput.value);

        // Find the selected accessory in the accessories array and update its scale
        const selectedAccessoryData = accessories.find(accessory => accessory.img.src === document.querySelector('.selected-thumbnail-img').src);
        if (selectedAccessoryData) {
            selectedAccessoryData.scale = selectedAccessoryScale;
        }

        drawAccessories();
    }

    // 获取下载按钮元素
    const downloadButton = document.getElementById('downloadButton');

    // 添加下载按钮点击事件监听
    downloadButton.addEventListener('click', () => {
        downloadCanvasAsImage(canvas, 'avatar.png');
    });

    // 定义下载画布为图片的函数
    function downloadCanvasAsImage(canvas, filename) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    }

});
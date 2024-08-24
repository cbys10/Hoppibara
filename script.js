document.addEventListener("DOMContentLoaded", () => {

    if (!localStorage.getItem("highScore")) {
        localStorage.setItem("highScore", 0);
    }

    console.log("%c Welcome to Hopibara", "font-size: 55px; color: green; font-weight: bold;");
    console.log("%c This is a game made in kaboom.js, this game is a revival of a youtuber's game. I just wanted to make it a real working webgame.", "font-size: 22px;");
    console.log("%c Credits:", "font-size: 55px;");
    console.log("%c Goodgis:", "font-size: 35px; font-weight: bold;");
    console.log("%c This is the original creator of Hoppibara, any code I could find was used so I could make this as similar to the original as I could. HUGE thanks to him for any code, and his idea of this game.", "font-size: 15px;");
    console.log("%c SOUNDGOD:", "font-size: 35px; font-weight: bold;");
    console.log("%c Oh, that's me :), I am the developer of this remake.", "font-size: 15px;");
    console.log("%c Pig55:", "font-size: 35px; font-weight: bold;");
    console.log("%c A very good friend of mine, and decided to help make the newer art assets for this remake, HUGE thanks to him.", "font-size: 15px;");

    kaboom({
        background: [251, 210, 149],
        width: window.innerWidth,
        height: window.innerHeight,
    });

    loadSprite("capybara", "./assets/images/capybara.png");
    loadSprite("capybara2", "./assets/images/capybara2.png");
    loadSprite("hazard1", "./assets/images/hazards/hazard1.png");
    loadSprite("hazard2", "./assets/images/hazards/hazard2.png");
    loadSprite("hazard3", "./assets/images/hazards/hazard3.png");
    loadSprite("hazard4", "./assets/images/hazards/hazard4.png")
    loadSound("jump", "./assets/audio/jump.mp3");
    loadSound("gameOver", "./assets/audio/loss.mp3");
    loadSound("background", "./assets/audio/background.mp3");
    loadFont("baifont", "./assets/fonts/bai.ttf");
    loadSprite("tileSprite", "./assets/images/tile.png");
    loadSprite("leftIcon", "./assets/images/icons/left.png")
    loadSprite("rightIcon", "./assets/images/icons/right.png")
    loadSprite("actionIcon", "./assets/images/icons/jump.png")
    loadSprite("Lime", "./assets/images/menu/Lime.png")
    loadSprite("CapyBaraM", "./assets/images/menu/capybara.png")
    loadSprite("hoppibara", "./assets/images/menu/hoppibara.png")
    loadSprite("hoppibara2", "./assets/images/menu/hoppibara1.png")
    loadSprite("playIcon", "./assets/images/menu/playIcon.png")
    onLoad(() => {
        destroy(loadingText);
        go("gameplay");
    });

    let isGamePaused = false;
    let gamepad = null;
    let inputCooldown = 0.1;
    let lastInputTime = 0;

    scene("changeDeviceOri",()=>{
        add([
            text(`Please use a computer or tablet`, { font: "baifont" }),
            scale(0.3),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(0, 0, 0),
        ])
    })
    
    scene("gameover", (score) => {
        add([
            text(`Game Over`, { font: "baifont" }),
            scale(2.8),
            pos(width() / 2, height() / 2 - 250),
            anchor("center"),
            color(255, 255, 255),
        ]);

        const rectWidth = 400;
        const rectHeight = 200;
        const outlineThickness = 10;
        const outlineWidth = rectWidth + outlineThickness * 2;
        const outlineHeight = rectHeight + outlineThickness * 2;
        const outlineColor = rgb(107, 64, 1);

        add([
            rect(outlineWidth, outlineHeight),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(outlineColor),
        ]);

        add([
            rect(rectWidth, rectHeight),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(179, 120, 33),
        ]);

        add([
            text(`Your Score: ${score}`, { font: "baifont" }),
            scale(1.2),
            pos(width() / 2, height() / 2 - 20),
            anchor("center"),
            color(255, 255, 255),
        ]);

        loadSprite("retryIcon", "./assets/images/icons/retry.png");
        console.log("Loading retry icon sprite...");

        add([
            sprite("retryIcon"),
            pos(width() / 2, height() / 2 + 180),
            anchor("center"),
            z(20),
        ]);

        const retryBtn = add([
            rect(80, 80),
            outline(7),
            pos(width() / 2, height() / 2 + 180),
            anchor("center"),
            color(179, 120, 33),
            z(10),
            area(),
            "retryBtn",
        ]);

        add([
            text(`Best Score: ${localStorage.getItem('highScore')}`, { font: "baifont" }),
            scale(1.2),
            pos(width() / 2, height() / 2 + 40),
            anchor("center"),
            color(255, 255, 255),
        ]);

        retryBtn.onClick(() => {
            go("gameplay", true);
        });
        onUpdate(()=>{
            if(gamepad){
            if (gamepad.isPressed("south")) {
            go("gameplay", true);
            }
            }
        })
    });

    scene("gameplay", (isPlaying) => {
        setGravity(3000);

        const floorHeight = 250;
        const jump_strength = 1500;
        const SPEED = 800;
        const SPD = 650;
        const scrollSpeed = 600;
        const tileWidth = 113;
        const tileHeight = 110;
        const floorSegments = [];
        const tiles = [];

        let gameOver = false;
        let currentSprite = "capybara";
        let player;
        let leftButton;
        let rightButton;
        function addPlayer() {
            player = add([
                sprite("capybara"),
                pos(100, 100),
                anchor("center"),
                area(),
                body(),
            ]);
        }
       addPlayer()
        const addLeftButton = ()=>{
            leftButton = add([
                sprite("leftIcon"),
                pos(0 + 80, height() - 120),
                anchor("center"),
                area(),
                z(99),
                "leftBtn",
            ]);
            leftButton.onClick(() => {
            });
        }
        const addRightButton = ()=>{
            rightButton = add([
                sprite("rightIcon"),
                pos(leftButton.pos.x + 60, leftButton.pos.y),
                anchor("center"),
                area(),
                z(100),
                "rightBtn",
            ]);
            rightButton.onClick(() => {
            });
        }
        addLeftButton()
        function createFloorSegment(xPos) {
            const floor = add([
                rect(width(), floorHeight),
                pos(xPos, height() - floorHeight),
                color(255, 255, 255),
                area(),
                body({ isStatic: true }),
                z(98),
                { solid: true },
            ]);

            add([
                rect(width(), 6),
                pos(xPos, height() - floorHeight - 6),
                color(0, 0, 0),
            ]);

            return floor;
        }

        function updateFloorSegments() {
            floorSegments.forEach((floor, index) => {
                floor.pos.x -= scrollSpeed * dt();
                if (floor.pos.x < -floor.width) {
                    const lastFloor = floorSegments[(index + floorSegments.length - 1) % floorSegments.length];
                    floor.pos.x = lastFloor.pos.x + lastFloor.width;
                    tiles.forEach(tile => {
                        if (tile.pos.x < -tileWidth) {
                            tile.pos.x = lastFloor.pos.x + (width() - tileWidth);
                        }
                    });
                }
            });
        }

        floorSegments.push(createFloorSegment(0));
        floorSegments.push(createFloorSegment(width()));

        onUpdate(() => {
            updateFloorSegments();
        });

        if (!isPlaying) {
            play("background", { volume: 0.05, loop: true });
        }

        let isRotating = false;
        let rotation = 0;
        let walking2;

        function jump() {
            if (player.isGrounded()) {
                play("jump", { volume: 0.6 });
                player.jump(jump_strength);
                isRotating = true;
                rotation = 0;
                if (!walking2) {
                    walking2 = setInterval(() => {
                        if (currentSprite === "capybara") {
                            player.use(sprite("capybara2"));
                            currentSprite = "capybara2";
                        } else {
                            player.use(sprite("capybara"));
                            currentSprite = "capybara";
                        }
                    }, 120);
                }
            }
        }

        onUpdate(() => {
            if (isRotating) {
                player.angle += 10;
                rotation += 10;
                if (rotation >= 360) {
                    player.angle = 0;
                    isRotating = false;
                }
            }
            if (player.isGrounded() && walking2) {
                clearInterval(walking2);
                walking2 = null;
            }
        });

        onKeyDown("up", () => {
            jump();
        });

        onKeyDown("space", () => {
            jump();
        });

        let walking;

        onKeyDown("left", () => {
            if (player.pos.x > 0) {
                player.move(-SPEED, 0);
                if (!walking) {
                    walking = setInterval(() => {
                        if (currentSprite === "capybara") {
                            player.use(sprite("capybara2"));
                            currentSprite = "capybara2";
                        } else {
                            player.use(sprite("capybara"));
                            currentSprite = "capybara";
                        }
                    }, 120);
                }
            }
        });

        onKeyDown("right", () => {
            if (player.pos.x < width()) {
                player.move(SPEED, 0);
                if (!walking) {
                    walking = setInterval(() => {
                        if (currentSprite === "capybara") {
                            player.use(sprite("capybara2"));
                            currentSprite = "capybara2";
                        } else {
                            player.use(sprite("capybara"));
                            currentSprite = "capybara";
                        }
                    }, 120);
                }
            }
        });

        onKeyRelease("right", () => {
            clearInterval(walking);
            walking = null;
            player.use(sprite("capybara"));
        });

        onKeyRelease("left", () => {
            clearInterval(walking);
            walking = null;
            player.use(sprite("capybara"));
        });

        let score = 0;

        const scoreCard = add([
            text(score, { font: "baifont" }),
            scale(1.8),
            pos(width() / 2, 80),
            anchor("center"),
            color(0, 0, 0),
        ]);

        setInterval(() => {
            if (!gameOver && !isGamePaused) {
                score++;
                scoreCard.text = score;
                if (!localStorage.getItem("highScore")) {
                    localStorage.setItem("highScore", 0);
                } else {
                    if (localStorage.getItem("highScore") < score) {
                        localStorage.setItem("highScore", score);
                    }
                }
            }
        }, 300);

        const hazards = [];

        function spawnHazard() {
            const hazard = add([
                sprite("hazard" + (Math.floor(Math.random() * 4) + 1)),
                area(),
                pos(width(), height() - floorHeight),
                move(LEFT, SPD),
                anchor("botleft"),
                "hazard"
            ]);
            hazards.push(hazard);
            wait(rand(1, 3), spawnHazard);
        }

        player.onCollide("hazard", () => {
            gameOver = true;
            play("gameOver", { volume: 0.3 });
            go("gameover", score);
        });

        spawnHazard();

        let pauseOverlay, pauseText, resumeText, pauseOutline;

        onKeyPress("p", () => {
            if (!isGamePaused) {
                isGamePaused = true;
                const rectWidth = 400;
                const rectHeight = 200;
                const outlineThickness = 10;
                const outlineWidth = rectWidth + outlineThickness * 2;
                const outlineHeight = rectHeight + outlineThickness * 2;
                const outlineColor = rgb(107, 64, 1);

                pauseOutline = add([
                    rect(outlineWidth, outlineHeight),
                    pos(width() / 2, height() / 2),
                    anchor("center"),
                    color(outlineColor),
                ]);

                pauseOverlay = add([
                    rect(rectWidth, rectHeight),
                    pos(width() / 2, height() / 2),
                    anchor("center"),
                    color(179, 120, 33),
                ]);

                pauseText = add([
                    text("Paused", { font: "baifont" }),
                    scale(2.8),
                    pos(width() / 2, height() / 2 - 250),
                    anchor("center"),
                    color(255, 255, 255),
                    z(11),
                ]);

                resumeText = add([
                    text("Press P to Resume", { font: "baifont" }),
                    scale(1.2),
                    pos(width() / 2, height() / 2),
                    anchor("center"),
                    color(255, 255, 255),
                    z(11),
                ]);

                get().forEach((comp) => {
                    if (comp.update) {
                        comp._update = comp.update;
                        comp.update = () => { };
                    }
                });

            } else {
                isGamePaused = false;
                destroy(pauseOverlay);
                destroy(pauseOutline);
                destroy(pauseText);
                destroy(resumeText);

                get().forEach((comp) => {
                    if (comp._update) {
                        comp.update = comp._update;
                        delete comp._update;
                    }
                });
            }
        });
        onGamepadConnect((gamepad2) => {
            gamepad = gamepad2
        })
        onUpdate(() => {
            if (gamepad) {
                const leftStick = gamepad.getStick("left");

                if (gamepad.isPressed("south")) {
                    jump();
                }

                if (leftStick.x !== 0) {
                    const newX = player.pos.x + leftStick.x * SPEED * dt();

                    if (newX >= 0 && newX <= width()) {
                        player.move(leftStick.x * SPEED, 0);

                        if (!walking) {
                            walking = setInterval(() => {
                                if (currentSprite === "capybara") {
                                    player.use(sprite("capybara2"));
                                    currentSprite = "capybara2";
                                } else {
                                    player.use(sprite("capybara"));
                                    currentSprite = "capybara";
                                }
                            }, 120);
                        }
                    }
                } else {
                    clearInterval(walking);
                    walking = null;
                }
            }
        });


    });
    scene("menu",()=>{
        const capybara = add([
            sprite("CapyBaraM"),
            scale(0.8),
            pos(0 - 50, height() / 2 + 170),
            anchor("center"),
        ]);
        capybara.angle = 8;

        add([
            sprite("Lime"),
            pos(capybara.pos.x + 450, capybara.pos.y - 350),
            anchor("center"),
        ])
        if(WURFL.is_mobile){
        add([
            sprite("hoppibara"),
            pos(width() - 300,height()/2 - 200),
            anchor("center"),
        ])
     }else{
            add([
                sprite("hoppibara2"),
                pos(width() - 650,height()/2 - 330),
                anchor("center"),
            ])
     }
        if(WURFL .is_mobile){
            const playBtn = add([
                rect(65,65),
                pos(width() - 300, height() / 2 + 50),
                anchor("center"),
                color(179, 120, 33),
                outline(6),
                z(10),
                area(),
                "playBtn",
            ])
            add([
                sprite("playIcon"),
                pos(width() - 300, height() / 2 + 50),
                anchor("center"),
                z(11),
                area(),
            ])
            playBtn.onClick(() => {
                go("gameplay",false);
            })
        }else{
            const playBtn = add([
                rect(80,80),
                pos(width() - 620, height() / 2 + 50),
                anchor("center"),
                color(179, 120, 33),
                outline(6),
                z(10),
                area(),
                "playBtn",
            ])
            add([
                sprite("playIcon"),
                pos(width() - 620, height() / 2 + 50),
                anchor("center"),
                z(11),
                area(),
            ])
            playBtn.onClick(() => {
                go("gameplay",false);
            })
        }
    })
    if(WURFL.is_mobile && window.innerWidth <= 550){
        go("changeDeviceOri")
    }else{
        go("menu");
    }
});
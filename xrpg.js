/*:
 * @plugindesc Add a button that opens a custom window with categories on click.
 * @help This plugin adds a button to the top left corner of the screen. When clicked,
 * it opens a custom window with categories.
 */

var xRPG = xRPG || {};

xRPG.loadStyles = function() {
    var style_css = document.createElement("link");
    style_css.type = "text/css";
    style_css.rel = "stylesheet";
    style_css.href = "js/plugins/xrpg.css";
    document.head.appendChild(style_css);
};

xRPG.waitForData = function(checkFunction, callback, interval = 100) {
    if (checkFunction()) {
        callback();
    } else {
        setTimeout(() => xRPG.waitForData(checkFunction, callback, interval), interval);
    }
};

xRPG.initializeUI = function(scene) {
    scene.createMyButton();
    scene.createMyWindow();
    scene._currentCategory = 0;
    scene._categories = [{
            header: 'God Mode',
            func: scene.moduleGodMode
        },
        {
            header: 'No Clip',
            func: scene.moduleNoClip
        },
        {
            header: 'EnemyHP',
            func: scene.moduleEnemyHP
        },
        {
            header: 'PartyHP',
            func: scene.modulePartyHP
        },
        {
            header: 'PartyMP',
            func: scene.modulePartyMP
        },
        {
            header: 'PartyTP',
            func: scene.modulePartyTP
        },
        {
            header: 'Give Exp',
            func: scene.moduleGiveExp
        },
        {
            header: 'Stats',
            func: scene.moduleStats
        },
        {
            header: 'Gold',
            func: scene.moduleGold
        },
        {
            header: 'Items',
            func: scene.moduleItems
        },
        {
            header: 'Weapons',
            func: scene.moduleWeapons
        },
        {
            header: 'Armor',
            func: scene.moduleArmor
        },
        {
            header: 'Speed',
            func: scene.moduleSpeed
        },
        {
            header: 'Clear States',
            func: scene.moduleClearStates
        },
        {
            header: 'Variables',
            func: scene.moduleVariables
        },
        {
            header: 'Switches',
            func: scene.moduleSwitches
        },
        {
            header: 'Save and Recall',
            func: scene.moduleSaveAndRecall
        },
        {
            header: 'Teleport',
            func: scene.moduleTeleport
        }
    ];
    xRPG.waitForData(
        () => $gameActors && $gameActors._data,
        () => scene.loadCategory()
    );
};

(function() {
    // Load styles
    xRPG.loadStyles();

    // Wait until the game is fully loaded
    const _Scene_Base_start = Scene_Base.prototype.start;
    Scene_Base.prototype.start = function() {
        _Scene_Base_start.call(this);
        if (!this._myButton || !this._myWindow) {
            xRPG.initializeUI(this);
        }
    };

    Scene_Base.prototype.createMyButton = function() {
        // Create the button
        this._myButton = document.createElement('button');
        this._myButton.innerHTML = '+';
        this._myButton.style.position = 'absolute';
        this._myButton.style.left = '10px';
        this._myButton.style.top = '10px';
        this._myButton.style.zIndex = 1000; // Ensure the button is on top
        this._myButton.style.fontSize = '20px';
        document.body.appendChild(this._myButton);

        // Add click event listener
        this._myButton.addEventListener('click', this.onMyButtonClick.bind(this));
    };

    Scene_Base.prototype.createMyWindow = function() {
        // Create the window
        this._myWindow = document.createElement('div');
        this._myWindow.id = 'myCustomWindow';
        this._myWindow.style.display = 'none'; // Initially hidden

        // Create header
        this._myWindowHeader = document.createElement('div');
        this._myWindowHeader.id = 'myCustomWindowHeader';
        this._myWindow.appendChild(this._myWindowHeader);

        // Create content area
        this._myWindowContent = document.createElement('div');
        this._myWindowContent.id = 'myCustomWindowContent';
        this._myWindow.appendChild(this._myWindowContent);

        // Create arrows for categories
        this._leftCategoryArrow = document.createElement('div');
        this._leftCategoryArrow.id = 'leftArrow';
        this._leftCategoryArrow.className = 'arrowButton';
        this._leftCategoryArrow.innerHTML = '&lt;';
        this._leftCategoryArrow.addEventListener('click', this.switchCategory.bind(this, -1));
        this._myWindow.appendChild(this._leftCategoryArrow);

        this._rightCategoryArrow = document.createElement('div');
        this._rightCategoryArrow.id = 'rightArrow';
        this._rightCategoryArrow.className = 'arrowButton';
        this._rightCategoryArrow.innerHTML = '&gt;';
        this._rightCategoryArrow.addEventListener('click', this.switchCategory.bind(this, 1));
        this._myWindow.appendChild(this._rightCategoryArrow);

        document.body.appendChild(this._myWindow);
    };

    Scene_Base.prototype.onMyButtonClick = function() {
        // Toggle window visibility
        if (this._myWindow.style.display === 'none') {
            this._myWindow.style.display = 'block';
            // Ensure data is loaded before loading categories
            xRPG.waitForData(
                () => $gameActors && $gameActors._data,
                () => this.loadCategory()
            );
        } else {
            this._myWindow.style.display = 'none';
        }
    };

    // Ensure the window is removed when the scene changes
    const _Scene_Base_terminate = Scene_Base.prototype.terminate;
    Scene_Base.prototype.terminate = function() {
        if (this._myWindow) {
            this._myWindow.remove();
            this._myWindow = null;
        }
        if (this._myButton) {
            this._myButton.remove();
            this._myButton = null;
        }
        _Scene_Base_terminate.call(this);
    };

    Scene_Base.prototype.switchCategory = function(direction) {
        this._currentCategory += direction;
        if (this._currentCategory < 0) {
            this._currentCategory = this._categories.length - 1;
        } else if (this._currentCategory >= this._categories.length) {
            this._currentCategory = 0;
        }
        this.loadCategory();
    };

    Scene_Base.prototype.loadCategory = function() {
        const category = this._categories[this._currentCategory];
        this._myWindowHeader.innerHTML = `<span>${category.header}</span>`;
        this._myWindowContent.innerHTML = '';
        if (typeof category.func === 'function') {
            category.func.apply(this);
        } else {
            ////alert('Function not defined for category:', category.header);
        }
    };

    // Single Function for God Mode
    Scene_Base.prototype.moduleGodMode = function() {
        const members = $gameActors._data ? $gameActors._data.filter(actor => actor) : [];
        const content = members.map((actor, index) => {
            const status_text = actor.god_mode ? "<div class='radio_button radio_button_selected'></div>" : "<div class='radio_button'></div>";
            return `
                <div class="actorCard">
                    <div class="actorName">${actor.name()}</div>
                    <div class="actorGodModeToggle" data-actor-id="${actor.actorId()}">${status_text}</div>
                </div>
            `;
        }).join('');

        this._myWindowContent.innerHTML = `<div class="actorCardsContainer">${content}</div>`;

        document.querySelectorAll('.actorGodModeToggle').forEach(element => {
            element.addEventListener('click', (event) => {
                const actorId = element.getAttribute('data-actor-id');
                const actor = $gameActors.actor(actorId);
                this.toggleGodmode(actor, event.target);
            });
        });
    };

    Scene_Base.prototype.toggleGodmode = function(actor, target) {
        SoundManager.playSystemSound(1);
        if (!actor._originalFunctions) {
            actor._originalFunctions = {
                gainHp: actor.gainHp,
                setHp: actor.setHp,
                gainMp: actor.gainMp,
                setMp: actor.setMp,
                gainTp: actor.gainTp,
                setTp: actor.setTp,
                paySkillCost: actor.paySkillCost
            };
        }

        if (!actor.god_mode) {
            // Enable god mode
            actor.god_mode = true;
            ////alert(`God mode enabled for actor: ${actor.name()}`);

            actor.gainHp = function(value) {
                value = this.mhp;
                this._originalFunctions.gainHp.call(this, value);
            };

            actor.setHp = function(hp) {
                hp = this.mhp;
                this._originalFunctions.setHp.call(this, hp);
            };

            actor.gainMp = function(value) {
                value = this.mmp;
                this._originalFunctions.gainMp.call(this, value);
            };

            actor.setMp = function(mp) {
                mp = this.mmp;
                this._originalFunctions.setMp.call(this, mp);
            };

            actor.gainTp = function(value) {
                value = this.maxTp();
                this._originalFunctions.gainTp.call(this, value);
            };

            actor.setTp = function(tp) {
                tp = this.maxTp();
                this._originalFunctions.setTp.call(this, tp);
            };

            actor.paySkillCost = function(skill) {
                // empty function to prevent resource usage
            };

            actor.god_mode_interval = setInterval(function() {
                actor.gainHp(actor.mhp);
                actor.gainMp(actor.mmp);
                actor.gainTp(actor.maxTp());
            }, 100);

            target.classList.remove('radio_button');
            target.classList.add('radio_button_selected');
        } else {
            // Disable god mode
            actor.god_mode = false;
            ////alert(`God mode disabled for actor: ${actor.name()}`);

            actor.gainHp = actor._originalFunctions.gainHp;
            actor.setHp = actor._originalFunctions.setHp;
            actor.gainMp = actor._originalFunctions.gainMp;
            actor.setMp = actor._originalFunctions.setMp;
            actor.gainTp = actor._originalFunctions.gainTp;
            actor.setTp = actor._originalFunctions.setTp;
            actor.paySkillCost = actor._originalFunctions.paySkillCost;
            clearInterval(actor.god_mode_interval);

            target.classList.remove('radio_button_selected');
            target.classList.add('radio_button');
        }
    };

    // Other module functions with placeholder content
    Scene_Base.prototype.moduleNoClip = function() {
        // Получаем статус No Clip для текущего игрока
        const status_text = $gamePlayer._through ? "<div class='radio_button radio_button_selected'></div>" : "<div class='radio_button'></div>";

        // Отрисовываем контент категории
        this._myWindowContent.innerHTML = `
        <div class="noClipContainer">
            <div>No Clip: <span class="noClipToggle">${status_text}</span></div>
        </div>
    `;

        // Добавляем обработчик событий для радиокнопки
        document.querySelector('.noClipToggle').addEventListener('click', (event) => {
            this.toggleNoClip(event.target);
        });
    };

    // Функция для переключения No Clip режима
    Scene_Base.prototype.toggleNoClip = function(target) {
        // Включаем или выключаем No Clip режим
        $gamePlayer._through = !($gamePlayer._through);

        // Обновляем визуальное состояние радиокнопки
        if ($gamePlayer._through) {
            target.classList.remove('radio_button');
            target.classList.add('radio_button_selected');
            ////alert('No Clip enabled');
            SoundManager.playSystemSound(1);
        } else {
            target.classList.remove('radio_button_selected');
            target.classList.add('radio_button');
            ////alert('No Clip disabled');
            SoundManager.playSystemSound(2);
        }
    };


    Scene_Base.prototype.moduleEnemyHP = function() {
        // Отрисовываем контент категории
        this._myWindowContent.innerHTML = `
        <div class="enemyHPContainer">
            <div>Enemy HP to 0: <button class="enemyHpButton" data-hp="0">Set HP to 0</button></div>
            <div>Enemy HP to 1: <button class="enemyHpButton" data-hp="1">Set HP to 1</button></div>
        </div>
    `;

        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.enemyHpButton').forEach(button => {
            button.addEventListener('click', (event) => {
                const hp = parseInt(event.target.getAttribute('data-hp'));
                this.setEnemyHP(hp);
            });
        });
    };

    // Функция для установки HP врагов
    Scene_Base.prototype.setEnemyHP = function(hp) {
        var members = $gameTroop.members();
        for (var i = 0; i < members.length; i++) {
            if (members[i]) {
                members[i].setHp(hp);
            }
        }
        ////alert(`Enemy HP set to ${hp}`);
        SoundManager.playSystemSound(1);
    };


    Scene_Base.prototype.modulePartyHP = function() {
        this._myWindowContent.innerHTML = '<p>Party HP functionality here</p>';
    };

    Scene_Base.prototype.modulePartyMP = function() {
        this._myWindowContent.innerHTML = '<p>Party MP functionality здесь></p>';
    };

    Scene_Base.prototype.modulePartyTP = function() {
        this._myWindowContent.innerHTML = '<p>Party TP functionality here</p>';
    };

    Scene_Base.prototype.moduleGiveExp = function() {
        this._myWindowContent.innerHTML = '<p>Give Exp functionality here</p>';
    };

    Scene_Base.prototype.moduleStats = function() {
        this._myWindowContent.innerHTML = '<p>Stats functionality here</p>';
    };

    Scene_Base.prototype.moduleGold = function() {
        this._myWindowContent.innerHTML = '<p>Gold functionality here</p>';
    };

    Scene_Base.prototype.moduleItems = function() {
        const items = $dataItems.filter(item => item && item.name); // Получаем список всех предметов

        // Отрисовываем контент категории
        const content = items.map((item, index) => {
            const amount = $gameParty.numItems(item);
            return `
            <div class="itemCard">
                <div class="itemName">${item.name}</div>
                <div class="itemControls">
                    <button class="itemButton" data-item-id="${item.id}" data-action="add">+</button>
                    <span class="itemAmount">${amount}</span>
                    <button class="itemButton" data-item-id="${item.id}" data-action="remove">-</button>
                </div>
            </div>
        `;
        }).join('');

        this._myWindowContent.innerHTML = `<div class="itemCardsContainer">${content}</div>`;

        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.itemButton').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.getAttribute('data-item-id'));
                const action = event.target.getAttribute('data-action');
                this.updateItemAmount(itemId, action);
            });
        });
    };

    Scene_Base.prototype.updateItemAmount = function(itemId, action) {
        const item = $dataItems[itemId];
        if (!item) return;

        const amount = (action === 'add') ? 1 : -1;
        $gameParty.gainItem(item, amount);

        // Обновляем отображение количества предметов
        const itemCard = document.querySelector(`.itemButton[data-item-id="${itemId}"]`).parentElement;
        const itemAmount = itemCard.querySelector('.itemAmount');
        itemAmount.textContent = $gameParty.numItems(item);

        ////alert(`${item.name} ${action === 'add' ? 'added' : 'removed'}`);
        SoundManager.playSystemSound(action === 'add' ? 1 : 2);
    };


    Scene_Base.prototype.moduleWeapons = function() {
    const weapons = $dataWeapons.filter(weapon => weapon && weapon.name); // Получаем список всех оружий

    // Отрисовываем контент категории
    const content = weapons.map((weapon, index) => {
        const amount = $gameParty.numItems(weapon);
        return `
            <div class="itemCard">
                <div class="itemName">${weapon.name}</div>
                <div class="itemControls">
                    <button class="itemButton" data-item-id="${weapon.id}" data-action="add">+</button>
                    <span class="itemAmount">${amount}</span>
                    <button class="itemButton" data-item-id="${weapon.id}" data-action="remove">-</button>
                </div>
            </div>
        `;
    }).join('');

    this._myWindowContent.innerHTML = `<div class="itemCardsContainer">${content}</div>`;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.itemButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = parseInt(event.target.getAttribute('data-item-id'));
            const action = event.target.getAttribute('data-action');
            this.updateWeaponAmount(itemId, action);
        });
    });
};

Scene_Base.prototype.updateWeaponAmount = function(itemId, action) {
    const weapon = $dataWeapons[itemId];
    if (!weapon) return;

    const amount = (action === 'add') ? 1 : -1;
    $gameParty.gainItem(weapon, amount);

    // Обновляем отображение количества оружия
    const itemCard = document.querySelector(`.itemButton[data-item-id="${itemId}"]`).parentElement;
    const itemAmount = itemCard.querySelector('.itemAmount');
    itemAmount.textContent = $gameParty.numItems(weapon);

    //alert(`${weapon.name} ${action === 'add' ? 'added' : 'removed'}`);
    SoundManager.playSystemSound(action === 'add' ? 1 : 2);
};


    Scene_Base.prototype.moduleArmor = function() {
    const armors = $dataArmors.filter(armor => armor && armor.name); // Получаем список всех броней

    // Отрисовываем контент категории
    const content = armors.map((armor, index) => {
        const amount = $gameParty.numItems(armor);
        return `
            <div class="itemCard">
                <div class="itemName">${armor.name}</div>
                <div class="itemControls">
                    <button class="itemButton" data-item-id="${armor.id}" data-action="add">+</button>
                    <span class="itemAmount">${amount}</span>
                    <button class="itemButton" data-item-id="${armor.id}" data-action="remove">-</button>
                </div>
            </div>
        `;
    }).join('');

    this._myWindowContent.innerHTML = `<div class="itemCardsContainer">${content}</div>`;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.itemButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = parseInt(event.target.getAttribute('data-item-id'));
            const action = event.target.getAttribute('data-action');
            this.updateArmorAmount(itemId, action);
        });
    });
};

Scene_Base.prototype.updateArmorAmount = function(itemId, action) {
    const armor = $dataArmors[itemId];
    if (!armor) return;

    const amount = (action === 'add') ? 1 : -1;
    $gameParty.gainItem(armor, amount);

    // Обновляем отображение количества брони
    const itemCard = document.querySelector(`.itemButton[data-item-id="${itemId}"]`).parentElement;
    const itemAmount = itemCard.querySelector('.itemAmount');
    itemAmount.textContent = $gameParty.numItems(armor);

    //alert(`${armor.name} ${action === 'add' ? 'added' : 'removed'}`);
    SoundManager.playSystemSound(action === 'add' ? 1 : 2);
};


    Scene_Base.prototype.moduleSpeed = function() {
    this._myWindowContent.innerHTML = `
        <div class="speedContainer">
            <div>Current Speed: <span class="currentSpeed">${$gamePlayer._moveSpeed}</span></div>
            <div>
                <button class="speedButton" data-action="decrease">-</button>
                <button class="speedButton" data-action="increase">+</button>
            </div>
            <div>
                <button class="speedLockButton">${this.speedUnlocked ? 'Lock Speed' : 'Unlock Speed'}</button>
            </div>
        </div>
    `;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.speedButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.getAttribute('data-action');
            this.changePlayerSpeed(action === 'increase' ? 1 : -1);
        });
    });

    document.querySelector('.speedLockButton').addEventListener('click', () => {
        this.toggleSpeedLock();
    });
};

Scene_Base.prototype.initializeSpeedLock = function() {
    if (!this.speedInitialized) {
        this.speed = $gamePlayer._moveSpeed;
        Object.defineProperty($gamePlayer, "_moveSpeed", {
            get: function() {
                return this.speed;
            }.bind(this),
            set: function(newVal) {
                if (this.speedUnlocked) {
                    this.speed = newVal;
                }
            }.bind(this)
        });
        this.speedInitialized = true;
    }
};

Scene_Base.prototype.changePlayerSpeed = function(amount) {
    this.initializeSpeedLock();
    this.speed += amount;
    document.querySelector('.currentSpeed').textContent = this.speed;
    SoundManager.playSystemSound(amount > 0 ? 1 : 2);
};

Scene_Base.prototype.toggleSpeedLock = function() {
    this.initializeSpeedLock();
    this.speedUnlocked = !this.speedUnlocked;
    document.querySelector('.speedLockButton').textContent = this.speedUnlocked ? 'Lock Speed' : 'Unlock Speed';
    SoundManager.playSystemSound(this.speedUnlocked ? 1 : 2);
};


    Scene_Base.prototype.moduleClearStates = function() {
    this._myWindowContent.innerHTML = `
        <div class="clearStatesContainer">
            <button class="clearStatesButton" data-action="current">Clear Current Actor States</button>
            <button class="clearStatesButton" data-action="party">Clear Party States</button>
        </div>
    `;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.clearStatesButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.getAttribute('data-action');
            if (action === 'current') {
                this.clearCurrentActorStates();
            } else if (action === 'party') {
                this.clearPartyStates();
            }
        });
    });
};

Scene_Base.prototype.clearActorStates = function(actor) {
    if (actor instanceof Game_Actor) {
        if (actor._states && actor._states.length > 0) {
            actor.clearStates();
        }
    }
};

Scene_Base.prototype.clearPartyStates = function() {
    const members = $gameParty.allMembers();
    members.forEach(member => {
        this.clearActorStates(member);
    });
    //alert('Party states cleared');
    SoundManager.playSystemSound(1);
};

Scene_Base.prototype.clearCurrentActorStates = function() {
    const currentActor = $gameParty.members()[0]; // Предполагается, что первый член партии - текущий актер
    this.clearActorStates(currentActor);
    //alert(`States cleared for ${currentActor.name()}`);
    SoundManager.playSystemSound(1);
};


    Scene_Base.prototype.moduleVariables = function() {
    const variables = $dataSystem.variables.filter(variable => variable); // Получаем список всех переменных

    // Отрисовываем контент категории
    const content = variables.map((variable, index) => {
        const value = $gameVariables.value(index);
        return `
            <div class="itemCard">
                <div class="itemName">${variable}</div>
                <div class="itemControls">
                    <button class="itemButton" data-variable-id="${index}" data-action="increase">+</button>
                    <span class="itemAmount">${value}</span>
                    <button class="itemButton" data-variable-id="${index}" data-action="decrease">-</button>
                </div>
            </div>
        `;
    }).join('');

    this._myWindowContent.innerHTML = `<div class="itemCardsContainer">${content}</div>`;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.itemButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const variableId = parseInt(event.target.getAttribute('data-variable-id'));
            const action = event.target.getAttribute('data-action');
            this.updateVariableValue(variableId, action);
        });
    });
};

Scene_Base.prototype.updateVariableValue = function(variableId, action) {
    if ($dataSystem.variables[variableId] === undefined) return;

    const amount = (action === 'increase') ? 1 : -1;
    const newValue = $gameVariables.value(variableId) + amount;
    $gameVariables.setValue(variableId, newValue);

    // Обновляем отображение значения переменной
    const itemCard = document.querySelector(`.itemButton[data-variable-id="${variableId}"]`).parentElement;
    const itemAmount = itemCard.querySelector('.itemAmount');
    itemAmount.textContent = $gameVariables.value(variableId);

    //alert(`Variable ${$dataSystem.variables[variableId]} ${action === 'increase' ? 'increased' : 'decreased'} to ${newValue}`);
    SoundManager.playSystemSound(action === 'increase' ? 1 : 2);
};


    Scene_Base.prototype.moduleSwitches = function() {
    const switches = $dataSystem.switches.filter(switchName => switchName); // Получаем список всех переключателей

    // Отрисовываем контент категории
    const content = switches.map((switchName, index) => {
        const value = $gameSwitches.value(index);
        const statusText = value ? "<div class='switch_button switch_button_on'></div>" : "<div class='switch_button switch_button_off'></div>";
        return `
            <div class="switchCard">
                <div class="switchName">${switchName}</div>
                <div class="switchControls">
                    <div class="switchToggle" data-switch-id="${index}">${statusText}</div>
                </div>
            </div>
        `;
    }).join('');

    this._myWindowContent.innerHTML = `<div class="switchCardsContainer">${content}</div>`;

    // Добавляем обработчики событий для переключателей
    document.querySelectorAll('.switchToggle').forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            const switchId = parseInt(event.target.closest('.switchToggle').getAttribute('data-switch-id'));
            this.toggleSwitch(switchId, event.target);
        });
    });
};

Scene_Base.prototype.toggleSwitch = function(switchId, target) {
    if ($dataSystem.switches[switchId] === undefined) return;

    const newValue = !$gameSwitches.value(switchId);
    $gameSwitches.setValue(switchId, newValue);

    // Обновляем визуальное состояние переключателя
    if (newValue) {
        target.classList.remove('switch_button_off');
        target.classList.add('switch_button_on');
        //alert(`Switch ${$dataSystem.switches[switchId]} turned ON`);
        SoundManager.playSystemSound(1);
    } else {
        target.classList.remove('switch_button_on');
        target.classList.add('switch_button_off');
        //alert(`Switch ${$dataSystem.switches[switchId]} turned OFF`);
        SoundManager.playSystemSound(2);
    }
};


    Scene_Base.prototype.moduleSaveAndRecall = function() {
    // Инициализируем массив для сохраненных позиций, если он не существует
    this.savedPositions = JSON.parse(localStorage.getItem('savedPositions')) || Array(10).fill({ m: -1, x: 0, y: 0 });

    // Отрисовываем контент категории
    const content = this.savedPositions.map((pos, index) => {
        const mapName = pos.m !== -1 && $dataMapInfos[pos.m] ? $dataMapInfos[pos.m].name : 'NULL';
        const coordinates = pos.m !== -1 ? `(${pos.x}, ${pos.y})` : 'NULL';
        return `
            <div class="positionCard">
                <div class="positionHeader">Position ${index + 1}</div>
                <div class="positionDetails">Map: ${pos.m !== -1 ? pos.m : 'NULL'}: ${mapName}</div>
                <div class="positionCoordinates">Coordinates: ${coordinates}</div>
                <div class="positionControls">
                    <button class="positionButton" data-pos-id="${index}" data-action="save">Save</button>
                    <button class="positionButton" data-pos-id="${index}" data-action="recall">Recall</button>
                </div>
            </div>
        `;
    }).join('');

    this._myWindowContent.innerHTML = `<div class="positionCardsContainer">${content}</div>`;

    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.positionButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const posId = parseInt(event.target.getAttribute('data-pos-id'));
            const action = event.target.getAttribute('data-action');
            if (action === 'save') {
                this.savePosition(posId);
            } else if (action === 'recall') {
                this.recallPosition(posId);
            }
        });
    });
};

Scene_Base.prototype.savePosition = function(posId) {
    this.savedPositions[posId] = {
        m: $gameMap.mapId(),
        x: $gamePlayer.x,
        y: $gamePlayer.y
    };

    // Сохраняем позиции в localStorage
    localStorage.setItem('savedPositions', JSON.stringify(this.savedPositions));

    //alert(`Position ${posId + 1} saved`);
    SoundManager.playSystemSound(1);
    this.moduleSaveAndRecall(); // Обновляем отображение
};

Scene_Base.prototype.recallPosition = function(posId) {
    const pos = this.savedPositions[posId];
    if (pos.m !== -1) {
        $gamePlayer.reserveTransfer(pos.m, pos.x, pos.y);
        //alert(`Teleported to position ${posId + 1}`);
        SoundManager.playSystemSound(1);
    } else {
        //alert(`No position saved in slot ${posId + 1}`);
        SoundManager.playSystemSound(2);
    }
};


    Scene_Base.prototype.moduleTeleport = function() {
    // Инициализируем телепорт локацию, если она не существует
    this.teleportLocation = this.teleportLocation || { m: 1, x: 0, y: 0 };

    // Получаем список всех карт с именами
    const mapOptions = $dataMapInfos.map((mapInfo, index) => {
        if (mapInfo) {
            return `<option value="${index}" ${this.teleportLocation.m === index ? 'selected' : ''}>${index}: ${mapInfo.name}</option>`;
        }
        return '';
    }).join('');

    // Отрисовываем контент категории
    this._myWindowContent.innerHTML = `
        <div class="teleportContainer">
            <div class="teleportField">
                <label for="mapId">Map:</label>
                <select id="mapId">${mapOptions}</select>
            </div>
            <div class="teleportField">
                <label for="xPos">X Coordinate:</label>
                <input type="number" id="xPos" value="${this.teleportLocation.x}" min="0" max="255">
            </div>
            <div class="teleportField">
                <label for="yPos">Y Coordinate:</label>
                <input type="number" id="yPos" value="${this.teleportLocation.y}" min="0" max="255">
            </div>
            <div class="teleportControls">
                <button id="teleportButton">Teleport</button>
            </div>
        </div>
    `;

    // Добавляем обработчик событий для кнопки телепортации
    document.getElementById('teleportButton').addEventListener('click', () => {
        this.teleportLocation.m = parseInt(document.getElementById('mapId').value);
        this.teleportLocation.x = parseInt(document.getElementById('xPos').value);
        this.teleportLocation.y = parseInt(document.getElementById('yPos').value);
        this.teleportCurrentLocation();
    });
};

Scene_Base.prototype.teleportCurrentLocation = function() {
    const pos = this.teleportLocation;
    if (pos.m >= 1 && pos.m < $dataMapInfos.length) {
        $gamePlayer.reserveTransfer(pos.m, pos.x, pos.y, $gamePlayer.direction(), 0);
        $gamePlayer.setPosition(pos.x, pos.y);
        //alert(`Teleported to map ${pos.m} at (${pos.x}, ${pos.y})`);
        SoundManager.playSystemSound(1);
    } else {
        //alert(`Invalid map ID: ${pos.m}`);
        SoundManager.playSystemSound(2);
    }
};


})();
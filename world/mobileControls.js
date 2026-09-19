/**
 * Mobile touch controls for the 3D world.
 * - Virtual joystick for movement (left side)
 * - Action buttons: jump, chat, mute, menu (right side)
 * - Top buttons: menu, mute
 * - Touch look (drag on right half of screen)
 */
export class MobileControls {
  constructor(world, app) {
    this.world = world;
    this.app = app;
    this.active = false;
    
    // Joystick state
    this.joystickActive = false;
    this.joystickX = 0;
    this.joystickY = 0;
    this.joystickTouchId = null;
    
    // Look state
    this.lookActive = false;
    this.lookTouchId = null;
    this.lastLookX = 0;
    this.lastLookY = 0;
    
    // Keys emulated by touch
    this.emulatedKeys = {};
    
    this.init();
  }
  
  init() {
    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;
    
    this.active = true;
    this.createElements();
    this.setupJoystick();
    this.setupLook();
    this.setupActionButtons();
    this.setupMenu();
    
    // Override world's key state with our emulated keys
    this.originalKeys = this.world.keys;
    this.world.keys = new Proxy(this.emulatedKeys, {
      get: (target, prop) => target[prop] || false,
      set: (target, prop, value) => { target[prop] = value; return true; }
    });
  }
  
  createElements() {
    // Mobile controls container
    const container = document.createElement('div');
    container.className = 'mobile-controls active';
    container.id = 'mobile-controls';
    container.innerHTML = `
      <div class="top-buttons">
        <button class="top-btn" id="mobile-menu-btn">☰</button>
        <button class="top-btn" id="mobile-mic-btn">🎤</button>
      </div>
      
      <div class="joystick-zone" id="joystick-zone">
        <div class="joystick-base"></div>
        <div class="joystick-knob" id="joystick-knob"></div>
      </div>
      
      <div class="action-buttons">
        <button class="action-btn jump" id="mobile-jump-btn">⬆</button>
        <button class="action-btn" id="mobile-chat-btn">💬</button>
        <button class="action-btn" id="mobile-mute-btn">🔇</button>
      </div>
      
      <div class="menu-overlay" id="menu-overlay">
        <div class="menu-card">
          <button class="menu-close" id="menu-close-btn">✕</button>
          <h2>Menu</h2>
          
          <div class="menu-item">
            <label>Room</label>
            <span class="badge" id="menu-room-name">—</span>
          </div>
          
          <div class="menu-item">
            <label>Peers</label>
            <span class="badge" id="menu-peer-count">0</span>
          </div>
          
          <div class="menu-item">
            <label>Microphone</label>
            <span class="badge" id="menu-mic-status">Muted</span>
          </div>
          
          <input class="menu-input" id="menu-room-input" type="text" placeholder="Enter room ID to join" />
          <button class="menu-btn" id="menu-join-btn">Join Room</button>
          <button class="menu-btn secondary" id="menu-leave-btn">Leave Room</button>
          <button class="menu-btn danger" id="menu-delete-btn" style="background: #f85149; display: none;">Delete Room</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
    
    // Inject mobile CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './mobile.css';
    document.head.appendChild(link);
  }
  
  setupJoystick() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !knob) return;
    
    const radius = 60; // max distance from center
    const knobRadius = 25;
    
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.joystickActive = true;
      this.updateJoystick(touch.clientX, touch.clientY, zone, knob, radius);
    }, { passive: false });
    
    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystick(touch.clientX, touch.clientY, zone, knob, radius);
          break;
        }
      }
    }, { passive: false });
    
    zone.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.joystickActive = false;
          this.joystickTouchId = null;
          this.joystickX = 0;
          this.joystickY = 0;
          knob.style.left = '35px';
          knob.style.top = '35px';
          this.emulatedKeys['KeyW'] = false;
          this.emulatedKeys['KeyS'] = false;
          this.emulatedKeys['KeyA'] = false;
          this.emulatedKeys['KeyD'] = false;
          break;
        }
      }
    });
  }
  
  updateJoystick(clientX, clientY, zone, knob, radius) {
    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    
    // Move knob
    knob.style.left = (35 + dx) + 'px';
    knob.style.top = (35 + dy) + 'px';
    
    // Normalize to -1..1
    const nx = dx / radius;
    const ny = dy / radius;
    
    // Emulate WASD keys based on joystick direction
    const deadzone = 0.3;
    this.emulatedKeys['KeyW'] = ny < -deadzone;
    this.emulatedKeys['KeyS'] = ny > deadzone;
    this.emulatedKeys['KeyA'] = nx < -deadzone;
    this.emulatedKeys['KeyD'] = nx > deadzone;
  }
  
  setupLook() {
    // Right half of screen for look
    document.addEventListener('touchstart', (e) => {
      if (!this.active) return;
      for (const touch of e.changedTouches) {
        if (touch.clientX > window.innerWidth / 2 && this.lookTouchId === null) {
          this.lookTouchId = touch.identifier;
          this.lookActive = true;
          this.lastLookX = touch.clientX;
          this.lastLookY = touch.clientY;
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!this.active) return;
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          const dx = touch.clientX - this.lastLookX;
          const dy = touch.clientY - this.lastLookY;
          
          this.world.yaw -= dx * 0.003;
          this.world.pitch -= dy * 0.003;
          this.world.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.world.pitch));
          
          this.lastLookX = touch.clientX;
          this.lastLookY = touch.clientY;
          break;
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
          this.lookActive = false;
          break;
        }
      }
    });
  }
  
  setupActionButtons() {
    const jumpBtn = document.getElementById('mobile-jump-btn');
    const chatBtn = document.getElementById('mobile-chat-btn');
    const muteBtn = document.getElementById('mobile-mute-btn');
    
    if (jumpBtn) {
      jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.world.grounded) {
          this.world.velocity.y = this.world.jumpForce;
          this.world.grounded = false;
        }
      });
    }
    
    if (chatBtn) {
      chatBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.app.chatOpen) {
          this.app.closeChat();
        } else {
          this.app.openChat();
        }
      });
    }
    
    if (muteBtn) {
      muteBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.app.toggleMute();
        const isMuted = this.app.micMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🎤';
      });
    }
  }
  
  setupMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeBtn = document.getElementById('menu-close-btn');
    const joinBtn = document.getElementById('menu-join-btn');
    const leaveBtn = document.getElementById('menu-leave-btn');
    const roomInput = document.getElementById('menu-room-input');
    const micBtn = document.getElementById('mobile-mic-btn');
    const deleteBtn = document.getElementById('menu-delete-btn');
    
    this.isRoomCreator = false;
    
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        this.updateMenuInfo();
        menuOverlay.classList.add('active');
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
      });
    }
    
    if (joinBtn) {
      joinBtn.addEventListener('click', () => {
        const roomId = roomInput.value.trim();
        if (roomId) {
          this.app.join(roomId, 'Player');
          menuOverlay.classList.remove('active');
        }
      });
    }
    
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        this.app.network.leave();
        menuOverlay.classList.remove('active');
        document.getElementById('join-modal').style.display = 'flex';
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.app.isRoomCreator) {
          this.app.network.deleteRoom();
          menuOverlay.classList.remove('active');
          document.getElementById('join-modal').style.display = 'flex';
        } else {
          alert('Only the room creator can delete this room');
        }
      });
    }
    
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.app.toggleMute();
        const isMuted = this.app.micMuted;
        micBtn.textContent = isMuted ? '🔇' : '🎤';
        this.updateMenuInfo();
      });
    }
    
    // Close overlay when clicking outside card
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        menuOverlay.classList.remove('active');
      }
    });
  }
  
  updateMenuInfo() {
    const roomName = document.getElementById('menu-room-name');
    const peerCount = document.getElementById('menu-peer-count');
    const micStatus = document.getElementById('menu-mic-status');
    
    if (roomName) roomName.textContent = this.app.network.roomId || '—';
    if (peerCount) peerCount.textContent = this.app.peers.size;
    if (micStatus) micStatus.textContent = this.app.micMuted ? 'Muted' : 'On';
  }
}

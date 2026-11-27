(() => {
  'use strict';

  const STORAGE_KEY = 'kho_bau_tri_thuc_v1';
  const ADMIN_CREDENTIALS = { username: 'admin', password: '123456' };

  // ==================== SOUND ENGINE (Web Audio API) ====================
  const SoundFX = {
    enabled: true,
    ctx: null,
    getContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },
    playTone(freq, duration, type = 'sine', delay = 0, volume = 0.14) {
      if (!this.enabled) return;
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    },
    wrong() {
      this.playTone(220, 0.16, 'sawtooth', 0, 0.1);
      this.playTone(170, 0.24, 'sawtooth', 0.14, 0.1);
    },
    unlock() {
      this.playTone(523.25, 0.14, 'triangle', 0, 0.16);
      this.playTone(659.25, 0.14, 'triangle', 0.1, 0.16);
      this.playTone(783.99, 0.25, 'triangle', 0.2, 0.18);
    },
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => this.playTone(n, 0.22, 'triangle', i * 0.11, 0.18));
      this.playTone(1046.5, 0.55, 'sine', 0.48, 0.2);
    },
  };

  // ==================== CONFETTI / FIREWORKS ====================
  const Confetti = (() => {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const colors = ['#f59e0b', '#ec4899', '#6366f1', '#10b981', '#3b82f6', '#f43f5e', '#facc15'];

    function launch(count = 90) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.35 - 20,
          vx: (Math.random() - 0.5) * 9,
          vy: Math.random() * -6 - 2,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          life: 1,
        });
      }
      if (!animId) tick();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 30);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24;
        p.rotation += p.vRot;
        p.life -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      }
      if (particles.length > 0) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return { launch };
  })();

  // ==================== SEED DATA ====================
  function createSeedRoom() {
    return {
      id: 'LOP3A',
      title: 'Phòng mẫu Lớp 3A - Khám phá tri thức',
      createdAt: Date.now(),
      questions: [
        {
          id: 'q_seed_1',
          type: 'multiple_choice',
          prompt: 'Con vật nào sau đây thường kêu "Meo meo" và thích bắt chuột?',
          options: ['Con chó', 'Con mèo', 'Con vịt', 'Con gà'],
          correctIndex: 1,
        },
        {
          id: 'q_seed_2',
          type: 'multiple_choice',
          prompt: 'Kết quả của phép tính 25 + 17 bằng bao nhiêu?',
          options: ['32', '41', '42', '43'],
          correctIndex: 2,
        },
        {
          id: 'q_seed_3',
          type: 'short_answer',
          prompt: 'Một tuần lễ có tất cả mấy ngày? (Bé hãy điền số nhé)',
          correctAnswer: '7',
        },
      ],
    };
  }

  function createRungXanhRoom() {
    return {
      id: 'RUNGXANH',
      title: 'Thám tử nhí – Vụ án Rừng Xanh Kêu Cứu',
      createdAt: Date.now() + 1,
      questions: [
        {
          id: 'q_rungxanh_1',
          type: 'short_answer',
          image: 'images/hien-truong-1.png',
          prompt:
            'HIỆN TRƯỜNG 1: TRUY TÌM HÀNH VI GÂY HẠI\nQuan sát tranh trên, có bao nhiêu hành động GÂY HẠI cho môi trường sống của thực vật và động vật? (Nhập 1 chữ số)',
          correctAnswer: '3',
          wrongHint: 'Chưa chính xác! Thám tử hãy đếm lại số hành vi gây hại nhé!',
        },
        {
          id: 'q_rungxanh_2',
          type: 'short_answer',
          prompt:
            'HIỆN TRƯỜNG 2: HẬU QUẢ CỦA Ô NHIỄM\nĐọc 3 thông tin thu thập được tại hiện trường:\n(1) Cá sông chết hàng loạt do nước thải.\n(2) Chim chóc kéo về làm tổ nhiều hơn.\n(3) Voi rừng mất nơi ở phải tràn vào làng tìm thức ăn.\n\nCó bao nhiêu thông tin nêu ĐÚNG hậu quả khi môi trường sống bị ô nhiễm? (Nhập 1 chữ số)',
          correctAnswer: '2',
          wrongHint: 'Chưa đúng rồi! Thám tử đọc kỹ lại 3 thông tin trên nhé!',
        },
        {
          id: 'q_rungxanh_3',
          type: 'short_answer',
          prompt:
            'HIỆN TRƯỜNG 3: PHÁ GIẢI BÍ ẨN BỜ SUỐI\nTình huống: Tuần trước, nhóm Thám tử đã vớt sạch rác ở bờ suối. Nhưng chỉ 3 ngày sau, rác lại ngập đầy và đàn cá vẫn chết! Thám tử chọn cách nào để cứu đàn cá mãi mãi?\n• Cách 1: Cứ mỗi ngày lại ra vớt rác tiếp.\n• Cách 2: Bắt hết cá ở suối mang về nuôi trong chậu.\n• Cách 3: Vừa dọn rác, vừa đặt thùng rác có nắp, cắm biển "Không xả rác" và tuyên truyền mọi người cùng giữ gìn.\n\nThám tử chọn Cách số mấy để giải quyết tận gốc vấn đề? (Nhập số 1, 2 hoặc 3)',
          correctAnswer: '3',
          wrongHint: 'Cách này chưa giải quyết được tận gốc đâu Thám tử ơi! Thử chọn cách khác nhé!',
        },
        {
          id: 'q_rungxanh_4',
          type: 'short_answer',
          prompt:
            'CHẶNG CUỐI: MỞ KHÓA HÒM GIẢI CỨU RỪNG XANH\nHãy ghép 3 chữ số tìm được ở 3 hiện trường để mở khóa Hòm Giải Cứu!',
          correctAnswer: '323',
          wrongHint: 'Mật mã sai! Hãy xem lại 3 con số em đã tìm được nhé!',
        },
      ],
    };
  }

  // ==================== UNIFIED DATA SERVICE (Firebase Firestore or localStorage) ====================
  const DataService = (() => {
    const cfg = window.FIREBASE_CONFIG;
    const hasFirebase =
      typeof window.firebase !== 'undefined' &&
      cfg &&
      typeof cfg.projectId === 'string' &&
      cfg.projectId.trim().length > 0;

    let db = null;
    if (hasFirebase) {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      db = firebase.firestore();
    }

    // --- LocalStorage helpers ---
    function loadLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const seed = { rooms: { LOP3A: { ...createSeedRoom(), students: [] } } };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
          return seed;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.rooms) {
          const seed = { rooms: { LOP3A: { ...createSeedRoom(), students: [] } } };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
          return seed;
        }
        return parsed;
      } catch {
        const seed = { rooms: { LOP3A: { ...createSeedRoom(), students: [] } } };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
    }

    function saveLocal(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    let unsubRooms = null;
    let unsubStudents = null;

    return {
      isCloud: hasFirebase,

      async ensureSeedRoom() {
        const seed = createSeedRoom();
        const rungXanh = createRungXanhRoom();
        const rxSeeded = localStorage.getItem('kho_bau_rx_seeded_v1');
        if (!hasFirebase) {
          const data = loadLocal();
          let changed = false;
          if (Object.keys(data.rooms).length === 0 && !localStorage.getItem('kho_bau_lop3a_seeded_v1')) {
            data.rooms.LOP3A = { ...seed, students: [] };
            localStorage.setItem('kho_bau_lop3a_seeded_v1', '1');
            changed = true;
          }
          if (!data.rooms.RUNGXANH && !rxSeeded) {
            data.rooms.RUNGXANH = { ...rungXanh, students: [] };
            localStorage.setItem('kho_bau_rx_seeded_v1', '1');
            changed = true;
          }
          if (changed) saveLocal(data);
          return;
        }
        if (!localStorage.getItem('kho_bau_lop3a_seeded_v1')) {
          const refLop = db.collection('rooms').doc('LOP3A');
          const snapLop = await refLop.get();
          if (!snapLop.exists) {
            await refLop.set(seed);
          }
          localStorage.setItem('kho_bau_lop3a_seeded_v1', '1');
        }
        if (!rxSeeded) {
          const refRx = db.collection('rooms').doc('RUNGXANH');
          const snapRx = await refRx.get();
          if (!snapRx.exists) {
            await refRx.set(rungXanh);
          }
          localStorage.setItem('kho_bau_rx_seeded_v1', '1');
        }
      },

      async getRoom(roomId) {
        if (!hasFirebase) {
          const data = loadLocal();
          return data.rooms[roomId] || null;
        }
        const snap = await db.collection('rooms').doc(roomId).get();
        if (!snap.exists) return null;
        return snap.data();
      },

      async getAllRoomsWithCounts() {
        if (!hasFirebase) {
          const data = loadLocal();
          return Object.values(data.rooms).map((r) => ({
            ...r,
            studentCount: (r.students || []).length,
          }));
        }
        const snap = await db.collection('rooms').orderBy('createdAt', 'asc').get();
        const rooms = [];
        for (const doc of snap.docs) {
          const r = doc.data();
          const stSnap = await db.collection('rooms').doc(r.id).collection('students').get();
          rooms.push({ ...r, studentCount: stSnap.size });
        }
        return rooms;
      },

      async getRoomStudents(roomId) {
        if (!hasFirebase) {
          const data = loadLocal();
          const r = data.rooms[roomId];
          return r ? r.students || [] : [];
        }
        const snap = await db.collection('rooms').doc(roomId).collection('students').get();
        return snap.docs.map((d) => d.data());
      },

      async createRoom(roomObj) {
        if (!hasFirebase) {
          const data = loadLocal();
          data.rooms[roomObj.id] = { ...roomObj, students: [] };
          saveLocal(data);
          return;
        }
        await db.collection('rooms').doc(roomObj.id).set(roomObj);
      },

      async updateRoom(roomId, patch) {
        if (!hasFirebase) {
          const data = loadLocal();
          if (data.rooms[roomId]) {
            Object.assign(data.rooms[roomId], patch);
            saveLocal(data);
          }
          return;
        }
        await db.collection('rooms').doc(roomId).update(patch);
      },

      async deleteRoom(roomId) {
        if (!hasFirebase) {
          const data = loadLocal();
          delete data.rooms[roomId];
          saveLocal(data);
          return;
        }
        const stSnap = await db.collection('rooms').doc(roomId).collection('students').get();
        const batch = db.batch();
        stSnap.docs.forEach((d) => batch.delete(d.ref));
        batch.delete(db.collection('rooms').doc(roomId));
        await batch.commit();
      },

      async saveQuestions(roomId, questions) {
        if (!hasFirebase) {
          const data = loadLocal();
          if (data.rooms[roomId]) {
            data.rooms[roomId].questions = questions;
            saveLocal(data);
          }
          return;
        }
        await db.collection('rooms').doc(roomId).update({ questions });
      },

      async addStudent(roomId, studentObj) {
        if (!hasFirebase) {
          const data = loadLocal();
          if (data.rooms[roomId]) {
            data.rooms[roomId].students.push(studentObj);
            saveLocal(data);
          }
          return;
        }
        await db.collection('rooms').doc(roomId).collection('students').doc(studentObj.userId).set(studentObj);
      },

      async updateStudent(roomId, userId, patch) {
        if (!hasFirebase) {
          const data = loadLocal();
          const r = data.rooms[roomId];
          if (r) {
            const st = r.students.find((s) => s.userId === userId);
            if (st) Object.assign(st, patch);
            saveLocal(data);
          }
          return;
        }
        await db.collection('rooms').doc(roomId).collection('students').doc(userId).update(patch);
      },

      async deleteStudent(roomId, userId) {
        if (!hasFirebase) {
          const data = loadLocal();
          const r = data.rooms[roomId];
          if (r) {
            r.students = r.students.filter((s) => s.userId !== userId);
            saveLocal(data);
          }
          return;
        }
        await db.collection('rooms').doc(roomId).collection('students').doc(userId).delete();
      },

      subscribeAdmin(roomId, onUpdate) {
        this.unsubscribeAdmin();
        if (!hasFirebase) return;
        unsubRooms = db.collection('rooms').onSnapshot(() => onUpdate());
        if (roomId) {
          unsubStudents = db.collection('rooms').doc(roomId).collection('students').onSnapshot(() => onUpdate());
        }
      },

      unsubscribeAdmin() {
        if (unsubRooms) {
          unsubRooms();
          unsubRooms = null;
        }
        if (unsubStudents) {
          unsubStudents();
          unsubStudents = null;
        }
      },
    };
  })();

  // ==================== HELPERS ====================
  function normalizeVietnameseName(name) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  function generateStudentId(name) {
    const clean = normalizeVietnameseName(name) || 'HocSinh';
    const shortName = clean.slice(0, 12);
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `HS_${shortName}_${digits}`;
  }

  function generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const colors = {
      info: 'bg-indigo-600 text-white',
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
    };
    const el = document.createElement('div');
    el.className = `pointer-events-auto px-4 py-3 rounded-2xl shadow-xl font-bold text-sm ${colors[type] || colors.info} animate-pop-in`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==================== APP STATE ====================
  let session = {
    view: 'home',
    room: null,
    student: null,
    adminLoggedIn: false,
    adminSelectedRoomId: 'LOP3A',
    adminTab: 'questions',
    isTransitioningDoor: false,
    adminRoomsCache: [],
    adminStudentsCache: [],
  };

  // Seed initial data on startup
  DataService.ensureSeedRoom().catch((err) => {
    console.error('Seed error:', err);
  });

  // Update sync badge in Admin
  const adminSyncBadge = document.getElementById('admin-sync-badge');
  if (DataService.isCloud) {
    adminSyncBadge.className = 'px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300';
    adminSyncBadge.textContent = '🟢 Đồng bộ Online (Firebase)';
  } else {
    adminSyncBadge.className = 'px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300';
    adminSyncBadge.textContent = '🟡 Offline (localStorage)';
  }

  // ==================== VIEW SWITCHING ====================
  const views = {
    home: document.getElementById('view-home'),
    game: document.getElementById('view-game'),
    victory: document.getElementById('view-victory'),
    admin: document.getElementById('view-admin'),
  };

  function switchView(viewName) {
    if (session.view === 'admin' && viewName !== 'admin') {
      DataService.unsubscribeAdmin();
    }
    session.view = viewName;
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== viewName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== SOUND TOGGLE & LOGO ====================
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  btnSoundToggle.addEventListener('click', () => {
    SoundFX.enabled = !SoundFX.enabled;
    soundIcon.textContent = SoundFX.enabled ? '🔊' : '🔇';
    soundLabel.textContent = SoundFX.enabled ? 'Âm thanh' : 'Đã tắt';
  });

  document.getElementById('btn-home-logo').addEventListener('click', () => {
    if (session.view === 'admin') {
      switchView('home');
    } else if (session.view === 'game' || session.view === 'victory') {
      session.room = null;
      session.student = null;
      switchView('home');
    }
  });

  // ==================== HOME / STUDENT ENTRY ====================
  const formStudentJoin = document.getElementById('form-student-join');
  const inputRoomId = document.getElementById('input-room-id');
  const inputStudentName = document.getElementById('input-student-name');
  const homeErrorBox = document.getElementById('home-error-box');
  const homeErrorText = document.getElementById('home-error-text');

  function showHomeError(msg) {
    homeErrorText.textContent = msg;
    homeErrorBox.classList.remove('hidden');
  }

  function hideHomeError() {
    homeErrorBox.classList.add('hidden');
  }

  document.getElementById('btn-fill-rungxanh').addEventListener('click', () => {
    inputRoomId.value = 'RUNGXANH';
    if (!inputStudentName.value.trim()) {
      inputStudentName.focus();
    }
    hideHomeError();
  });

  document.getElementById('btn-fill-sample').addEventListener('click', () => {
    inputRoomId.value = 'LOP3A';
    if (!inputStudentName.value.trim()) {
      inputStudentName.focus();
    }
    hideHomeError();
  });

  formStudentJoin.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideHomeError();

    const roomId = inputRoomId.value.trim().toUpperCase();
    const studentName = inputStudentName.value.trim();

    if (!roomId) {
      showHomeError('Bé hãy nhập Mã Phòng trước nhé!');
      inputRoomId.focus();
      return;
    }
    if (!studentName) {
      showHomeError('Bé hãy nhập Tên của mình nhé!');
      inputStudentName.focus();
      return;
    }

    try {
      await DataService.ensureSeedRoom();
      const room = await DataService.getRoom(roomId);
      if (!room) {
        showHomeError(`Không tìm thấy phòng "${roomId}". Bé kiểm tra lại mã phòng nhé!`);
        return;
      }

      if (!room.questions || room.questions.length === 0) {
        showHomeError(`Phòng "${roomId}" chưa có câu hỏi nào. Bé hãy nhờ thầy/cô thêm câu hỏi nhé!`);
        return;
      }

      const userId = generateStudentId(studentName);
      const newStudent = {
        userId,
        name: studentName,
        currentDoorIndex: 0,
        wrongCount: 0,
        status: 'playing',
        joinedAt: Date.now(),
      };

      await DataService.addStudent(roomId, newStudent);

      session.room = room;
      session.student = newStudent;
      session.isTransitioningDoor = false;

      renderGameView();
      switchView('game');
    } catch (err) {
      console.error(err);
      showHomeError('Có lỗi kết nối dữ liệu. Bé thử lại sau nhé!');
    }
  });

  // ==================== STUDENT GAMEPLAY ====================
  const secretDoor = document.getElementById('secret-door');
  const doorPlateNumber = document.getElementById('door-plate-number');
  const doorNumberBadge = document.getElementById('door-number-badge');
  const doorTotalBadge = document.getElementById('door-total-badge');
  const hudRoomId = document.getElementById('hud-room-id');
  const hudStudentName = document.getElementById('hud-student-name');
  const hudWrongCount = document.getElementById('hud-wrong-count');
  const hudDoorsTrack = document.getElementById('hud-doors-track');

  const modalQuestion = document.getElementById('modal-question');
  const modalQuestionCard = document.getElementById('modal-question-card');
  const modalDoorIndex = document.getElementById('modal-door-index');
  const modalQuestionImage = document.getElementById('modal-question-image');
  const modalQuestionPrompt = document.getElementById('modal-question-prompt');
  const modalMcOptions = document.getElementById('modal-mc-options');
  const modalSaForm = document.getElementById('modal-sa-form');
  const modalSaInput = document.getElementById('modal-sa-input');
  const modalFeedback = document.getElementById('modal-feedback');
  const modalFeedbackIcon = document.getElementById('modal-feedback-icon');
  const modalFeedbackText = document.getElementById('modal-feedback-text');

  function renderGameView() {
    const room = session.room;
    const student = session.student;
    if (!room || !student) {
      switchView('home');
      return;
    }

    const total = room.questions.length;
    const currentIdx = Math.min(student.currentDoorIndex, total - 1);

    hudRoomId.textContent = room.id;
    hudStudentName.textContent = student.name;
    hudWrongCount.textContent = student.wrongCount;

    doorNumberBadge.textContent = currentIdx + 1;
    doorTotalBadge.textContent = total;
    doorPlateNumber.textContent = currentIdx + 1;

    secretDoor.classList.remove('is-open', 'animate-door-shake');

    hudDoorsTrack.innerHTML = '';
    room.questions.forEach((_, idx) => {
      const pill = document.createElement('div');
      if (idx < student.currentDoorIndex) {
        pill.className = 'w-9 h-9 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center shadow-sm text-sm';
        pill.textContent = '✓';
        pill.title = `Cửa ${idx + 1}: Đã mở`;
      } else if (idx === student.currentDoorIndex) {
        pill.className = 'w-10 h-10 rounded-full bg-amber-400 text-amber-950 border-2 border-amber-600 font-extrabold flex items-center justify-center shadow-md text-base animate-pulse';
        pill.textContent = idx + 1;
        pill.title = `Cửa ${idx + 1}: Đang giải mã`;
      } else {
        pill.className = 'w-9 h-9 rounded-full bg-slate-200 text-slate-500 font-extrabold flex items-center justify-center text-sm';
        pill.textContent = '🔒';
        pill.title = `Cửa ${idx + 1}: Chưa mở`;
      }
      hudDoorsTrack.appendChild(pill);
    });
  }

  function openCurrentQuestionModal() {
    if (session.isTransitioningDoor) return;
    const room = session.room;
    const student = session.student;
    if (!room || !student) return;

    const q = room.questions[student.currentDoorIndex];
    if (!q) return;

    modalDoorIndex.textContent = student.currentDoorIndex + 1;
    if (q.image) {
      modalQuestionImage.src = q.image;
      modalQuestionImage.classList.remove('hidden');
    } else {
      modalQuestionImage.src = '';
      modalQuestionImage.classList.add('hidden');
    }
    modalQuestionPrompt.textContent = q.prompt;
    hideModalFeedback();

    if (q.type === 'multiple_choice') {
      modalMcOptions.classList.remove('hidden');
      modalSaForm.classList.add('hidden');
      modalMcOptions.innerHTML = '';

      const letters = ['A', 'B', 'C', 'D'];
      const badgeColors = [
        'bg-sky-100 text-sky-700',
        'bg-amber-100 text-amber-700',
        'bg-emerald-100 text-emerald-700',
        'bg-purple-100 text-purple-700',
      ];

      q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left px-4 py-3.5 rounded-2xl border-3 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 transition flex items-center gap-3 font-bold text-lg text-slate-800 cursor-pointer';
        btn.innerHTML = `
          <span class="w-9 h-9 rounded-xl ${badgeColors[idx]} font-display font-extrabold flex items-center justify-center shrink-0">${letters[idx]}</span>
          <span>${escapeHtml(optText)}</span>
        `;
        btn.addEventListener('click', () => handleAnswerAttempt(idx === q.correctIndex, btn));
        modalMcOptions.appendChild(btn);
      });
    } else {
      modalMcOptions.classList.add('hidden');
      modalSaForm.classList.remove('hidden');
      modalSaInput.value = '';
      setTimeout(() => modalSaInput.focus(), 80);
    }

    modalQuestion.classList.remove('hidden');
  }

  function closeQuestionModal() {
    modalQuestion.classList.add('hidden');
  }

  function showModalFeedback(isCorrect, text) {
    modalFeedback.classList.remove('hidden', 'bg-rose-50', 'border-2', 'border-rose-300', 'text-rose-700', 'bg-emerald-50', 'border-emerald-300', 'text-emerald-700');
    if (isCorrect) {
      modalFeedback.classList.add('bg-emerald-50', 'border-2', 'border-emerald-300', 'text-emerald-700');
      modalFeedbackIcon.textContent = '🌟';
    } else {
      modalFeedback.classList.add('bg-rose-50', 'border-2', 'border-rose-300', 'text-rose-700');
      modalFeedbackIcon.textContent = '🔒';
    }
    modalFeedbackText.textContent = text;
  }

  function hideModalFeedback() {
    modalFeedback.classList.add('hidden');
  }

  function triggerShake(el) {
    el.classList.remove('animate-door-shake');
    void el.offsetWidth;
    el.classList.add('animate-door-shake');
  }

  async function handleAnswerAttempt(isCorrect, clickedBtn = null) {
    if (session.isTransitioningDoor) return;
    const room = session.room;
    const student = session.student;
    if (!room || !student) return;

    if (!isCorrect) {
      student.wrongCount += 1;
      hudWrongCount.textContent = student.wrongCount;

      SoundFX.wrong();
      triggerShake(modalQuestionCard);
      triggerShake(secretDoor);

      if (clickedBtn) {
        clickedBtn.classList.add('border-rose-400', 'bg-rose-50');
      }

      const q = room.questions[student.currentDoorIndex];
      const wrongMsg = (q && q.wrongHint) || 'Ôi chưa đúng rồi, cánh cửa vẫn khóa chặt! Bé hãy suy nghĩ lại nhé!';
      showModalFeedback(false, wrongMsg);
      DataService.updateStudent(room.id, student.userId, { wrongCount: student.wrongCount }).catch(console.error);
      return;
    }

    session.isTransitioningDoor = true;
    SoundFX.unlock();
    Confetti.launch(75);
    showModalFeedback(true, 'Tuyệt vời! Bé trả lời chính xác rồi! Cánh cửa đang mở ra...');

    if (clickedBtn) {
      clickedBtn.classList.add('border-emerald-500', 'bg-emerald-50');
    }

    setTimeout(() => {
      closeQuestionModal();
      secretDoor.classList.add('is-open');

      setTimeout(async () => {
        student.currentDoorIndex += 1;
        if (student.currentDoorIndex >= room.questions.length) {
          student.status = 'completed';
          student.completedAt = Date.now();
          await DataService.updateStudent(room.id, student.userId, {
            currentDoorIndex: student.currentDoorIndex,
            status: 'completed',
            completedAt: student.completedAt,
          }).catch(console.error);

          session.isTransitioningDoor = false;
          renderVictoryView(room, student);
          switchView('victory');
          SoundFX.victory();
          Confetti.launch(150);
        } else {
          await DataService.updateStudent(room.id, student.userId, {
            currentDoorIndex: student.currentDoorIndex,
          }).catch(console.error);

          session.isTransitioningDoor = false;
          renderGameView();
        }
      }, 950);
    }, 800);
  }

  modalSaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const room = session.room;
    const student = session.student;
    if (!room || !student) return;
    const q = room.questions[student.currentDoorIndex];
    if (!q) return;

    const userAns = modalSaInput.value.trim().toLowerCase();
    const expected = String(q.correctAnswer || '').trim().toLowerCase();
    if (!userAns) {
      showModalFeedback(false, 'Bé hãy nhập câu trả lời vào ô trống nhé!');
      modalSaInput.focus();
      return;
    }
    handleAnswerAttempt(userAns === expected);
  });

  secretDoor.addEventListener('click', openCurrentQuestionModal);
  secretDoor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCurrentQuestionModal();
    }
  });
  document.getElementById('btn-open-question').addEventListener('click', openCurrentQuestionModal);
  document.getElementById('btn-close-question-modal').addEventListener('click', closeQuestionModal);

  document.getElementById('btn-exit-game').addEventListener('click', () => {
    session.room = null;
    session.student = null;
    switchView('home');
  });

  // ==================== VICTORY VIEW ====================
  function renderVictoryView(room, student) {
    document.getElementById('victory-student-name').textContent = student.name;
    document.getElementById('victory-doors-count').textContent = `${room.questions.length}/${room.questions.length}`;
    document.getElementById('victory-wrong-count').textContent = student.wrongCount;
  }

  document.getElementById('btn-victory-home').addEventListener('click', () => {
    session.room = null;
    session.student = null;
    inputStudentName.value = '';
    switchView('home');
  });

  // ==================== ADMIN LOGIN ====================
  const modalAdminLogin = document.getElementById('modal-admin-login');
  const formAdminLogin = document.getElementById('form-admin-login');
  const adminLoginUser = document.getElementById('admin-login-user');
  const adminLoginPass = document.getElementById('admin-login-pass');
  const adminLoginError = document.getElementById('admin-login-error');

  document.getElementById('btn-admin-open').addEventListener('click', async () => {
    if (session.adminLoggedIn) {
      switchView('admin');
      await renderAdminDashboard();
      return;
    }
    adminLoginError.classList.add('hidden');
    adminLoginUser.value = '';
    adminLoginPass.value = '';
    modalAdminLogin.classList.remove('hidden');
    setTimeout(() => adminLoginUser.focus(), 60);
  });

  document.getElementById('btn-close-admin-login').addEventListener('click', () => {
    modalAdminLogin.classList.add('hidden');
  });

  formAdminLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = adminLoginUser.value.trim();
    const p = adminLoginPass.value;
    if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
      session.adminLoggedIn = true;
      modalAdminLogin.classList.add('hidden');
      switchView('admin');
      await renderAdminDashboard();
    } else {
      adminLoginError.textContent = 'Sai tên đăng nhập hoặc mật khẩu! (Mặc định: admin / 123456)';
      adminLoginError.classList.remove('hidden');
    }
  });

  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    session.adminLoggedIn = false;
    switchView('home');
  });

  // ==================== ADMIN DASHBOARD ====================
  const adminRoomList = document.getElementById('admin-room-list');
  const adminRoomEmptyState = document.getElementById('admin-room-empty-state');
  const adminRoomWorkspace = document.getElementById('admin-room-workspace');
  const adminActiveRoomId = document.getElementById('admin-active-room-id');
  const adminActiveRoomTitle = document.getElementById('admin-active-room-title');
  const tabBtnQuestions = document.getElementById('tab-btn-questions');
  const tabBtnStudents = document.getElementById('tab-btn-students');
  const adminTabQuestions = document.getElementById('admin-tab-questions');
  const adminTabStudents = document.getElementById('admin-tab-students');
  const tabCountQuestions = document.getElementById('tab-count-questions');
  const tabCountStudents = document.getElementById('tab-count-students');

  document.getElementById('btn-random-room-id').addEventListener('click', () => {
    document.getElementById('admin-new-room-id').value = generateRoomId();
  });

  document.getElementById('form-create-room').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('admin-new-room-id');
    const titleInput = document.getElementById('admin-new-room-title');
    const roomId = idInput.value.trim().toUpperCase();
    const title = titleInput.value.trim();

    if (!roomId) {
      showToast('Vui lòng nhập Mã Phòng!', 'error');
      idInput.focus();
      return;
    }

    const existing = await DataService.getRoom(roomId);
    if (existing) {
      showToast(`Mã phòng "${roomId}" đã tồn tại!`, 'error');
      return;
    }

    await DataService.createRoom({
      id: roomId,
      title: title || `Phòng ${roomId}`,
      createdAt: Date.now(),
      questions: [],
    });

    session.adminSelectedRoomId = roomId;
    idInput.value = '';
    titleInput.value = '';
    resetQuestionForm();
    await renderAdminDashboard();
    showToast(`Đã tạo phòng ${roomId}!`, 'success');
  });

  function setAdminTab(tab) {
    session.adminTab = tab;
    const isQ = tab === 'questions';
    adminTabQuestions.classList.toggle('hidden', !isQ);
    adminTabStudents.classList.toggle('hidden', isQ);

    tabBtnQuestions.className = isQ
      ? 'px-4 py-2 rounded-xl font-extrabold text-sm transition cursor-pointer bg-white text-indigo-700 shadow-sm'
      : 'px-4 py-2 rounded-xl font-extrabold text-sm transition cursor-pointer text-slate-600 hover:text-indigo-700';

    tabBtnStudents.className = !isQ
      ? 'px-4 py-2 rounded-xl font-extrabold text-sm transition cursor-pointer bg-white text-indigo-700 shadow-sm'
      : 'px-4 py-2 rounded-xl font-extrabold text-sm transition cursor-pointer text-slate-600 hover:text-indigo-700';
  }

  tabBtnQuestions.addEventListener('click', () => setAdminTab('questions'));
  tabBtnStudents.addEventListener('click', async () => {
    setAdminTab('students');
    await refreshActiveRoomStudents();
  });

  document.getElementById('btn-refresh-students').addEventListener('click', async () => {
    await renderAdminDashboard();
    showToast('Đã cập nhật dữ liệu mới nhất!', 'info');
  });

  const formQuestion = document.getElementById('form-question');
  const qEditId = document.getElementById('q-edit-id');
  const qPrompt = document.getElementById('q-prompt');
  const qType = document.getElementById('q-type');
  const qMcFields = document.getElementById('q-mc-fields');
  const qSaFields = document.getElementById('q-sa-fields');
  const qShortAnswer = document.getElementById('q-short-answer');
  const questionFormHeading = document.getElementById('question-form-heading');
  const btnCancelEditQuestion = document.getElementById('btn-cancel-edit-question');

  qType.addEventListener('change', () => {
    const isMc = qType.value === 'multiple_choice';
    qMcFields.classList.toggle('hidden', !isMc);
    qSaFields.classList.toggle('hidden', isMc);
  });

  function resetQuestionForm() {
    qEditId.value = '';
    qPrompt.value = '';
    qType.value = 'multiple_choice';
    qMcFields.classList.remove('hidden');
    qSaFields.classList.add('hidden');
    for (let i = 0; i < 4; i++) {
      document.getElementById(`q-opt-${i}`).value = '';
    }
    const radios = document.querySelectorAll('input[name="q-correct-mc"]');
    if (radios[0]) radios[0].checked = true;
    qShortAnswer.value = '';
    questionFormHeading.textContent = '➕ Thêm Câu Hỏi Mới (Cánh Cửa Mới)';
    btnCancelEditQuestion.classList.add('hidden');
  }

  btnCancelEditQuestion.addEventListener('click', resetQuestionForm);

  formQuestion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const room = session.adminRoomsCache.find((r) => r.id === session.adminSelectedRoomId);
    if (!room) return;

    const prompt = qPrompt.value.trim();
    const type = qType.value;
    if (!prompt) {
      showToast('Vui lòng nhập nội dung câu hỏi!', 'error');
      qPrompt.focus();
      return;
    }

    const questionObj = {
      id: qEditId.value || `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      prompt,
    };

    if (type === 'multiple_choice') {
      const options = [0, 1, 2, 3].map((i) => document.getElementById(`q-opt-${i}`).value.trim());
      if (options.some((o) => !o)) {
        showToast('Vui lòng nhập đầy đủ cả 4 đáp án A, B, C, D!', 'error');
        return;
      }
      const checkedRadio = document.querySelector('input[name="q-correct-mc"]:checked');
      questionObj.options = options;
      questionObj.correctIndex = checkedRadio ? Number(checkedRadio.value) : 0;
    } else {
      const ans = qShortAnswer.value.trim();
      if (!ans) {
        showToast('Vui lòng nhập đáp án đúng!', 'error');
        qShortAnswer.focus();
        return;
      }
      questionObj.correctAnswer = ans;
    }

    const nextQuestions = [...(room.questions || [])];
    if (qEditId.value) {
      const idx = nextQuestions.findIndex((q) => q.id === qEditId.value);
      if (idx !== -1) nextQuestions[idx] = questionObj;
      showToast('Đã cập nhật câu hỏi!', 'success');
    } else {
      nextQuestions.push(questionObj);
      showToast('Đã thêm câu hỏi mới!', 'success');
    }

    await DataService.saveQuestions(room.id, nextQuestions);
    resetQuestionForm();
    await renderAdminDashboard();
  });

  // ==================== EDIT / DELETE ROOM HANDLERS ====================
  const modalEditRoom = document.getElementById('modal-edit-room');
  const formEditRoom = document.getElementById('form-edit-room');
  const editRoomIdDisplay = document.getElementById('edit-room-id-display');
  const editRoomTitleInput = document.getElementById('edit-room-title-input');

  function openEditRoomModal(room) {
    if (!room) return;
    editRoomIdDisplay.value = room.id;
    editRoomTitleInput.value = room.title || '';
    modalEditRoom.classList.remove('hidden');
    setTimeout(() => editRoomTitleInput.focus(), 60);
  }

  function closeEditRoomModal() {
    modalEditRoom.classList.add('hidden');
  }

  document.getElementById('btn-close-edit-room').addEventListener('click', closeEditRoomModal);
  document.getElementById('btn-cancel-edit-room').addEventListener('click', closeEditRoomModal);

  formEditRoom.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = editRoomIdDisplay.value.trim();
    const newTitle = editRoomTitleInput.value.trim();
    if (!roomId) return;
    await DataService.updateRoom(roomId, { title: newTitle || `Phòng ${roomId}` });
    closeEditRoomModal();
    await renderAdminDashboard();
    showToast(`Đã cập nhật tên phòng ${roomId}!`, 'success');
  });

  async function handleDeleteRoom(roomId) {
    if (!roomId) return;
    if (confirm(`Bạn có chắc muốn xóa phòng "${roomId}" và toàn bộ câu hỏi, kết quả học sinh trong phòng này không?`)) {
      await DataService.deleteRoom(roomId);
      if (session.adminSelectedRoomId === roomId) {
        session.adminSelectedRoomId = null;
      }
      await renderAdminDashboard();
      showToast(`Đã xóa phòng ${roomId}!`, 'info');
    }
  }

  document.getElementById('btn-edit-active-room').addEventListener('click', () => {
    const activeRoom = session.adminRoomsCache.find((r) => r.id === session.adminSelectedRoomId);
    openEditRoomModal(activeRoom);
  });

  document.getElementById('btn-delete-active-room').addEventListener('click', () => {
    handleDeleteRoom(session.adminSelectedRoomId);
  });

  let isRenderingAdmin = false;
  async function renderAdminDashboard() {
    if (isRenderingAdmin) return;
    isRenderingAdmin = true;
    try {
      const rooms = await DataService.getAllRoomsWithCounts();
      session.adminRoomsCache = rooms;

      adminRoomList.innerHTML = '';
      if (rooms.length === 0) {
        adminRoomList.innerHTML = '<div class="text-sm text-slate-400 font-semibold text-center py-4">Chưa có phòng nào.</div>';
        session.adminSelectedRoomId = null;
      } else {
        if (!session.adminSelectedRoomId || !rooms.some((r) => r.id === session.adminSelectedRoomId)) {
          session.adminSelectedRoomId = rooms[0].id;
        }

        rooms.forEach((r) => {
          const isActive = r.id === session.adminSelectedRoomId;
          const item = document.createElement('div');
          item.className = `flex items-center justify-between p-3 rounded-2xl border-2 transition cursor-pointer ${
            isActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 bg-slate-50/70'
          }`;
          item.innerHTML = `
            <div class="min-w-0 flex-1">
              <div class="font-display font-extrabold text-base text-indigo-900 truncate">${escapeHtml(r.id)}</div>
              <div class="text-xs font-bold text-slate-500 truncate">${escapeHtml(r.title || '')} • ${(r.questions || []).length} cửa • ${r.studentCount} HS</div>
            </div>
            <div class="flex items-center gap-1 ml-2 shrink-0">
              <button type="button" data-edit-room="${escapeHtml(r.id)}" title="Chỉnh sửa tên phòng" class="px-2 py-1 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer">✏️</button>
              <button type="button" data-delete-room="${escapeHtml(r.id)}" title="Xóa phòng" class="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer">🗑️</button>
            </div>
          `;
          item.addEventListener('click', async (e) => {
            if (e.target.closest('[data-delete-room]') || e.target.closest('[data-edit-room]')) return;
            session.adminSelectedRoomId = r.id;
            resetQuestionForm();
            await renderAdminDashboard();
          });
          item.querySelector('[data-edit-room]').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditRoomModal(r);
          });
          item.querySelector('[data-delete-room]').addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleDeleteRoom(r.id);
          });
          adminRoomList.appendChild(item);
        });
      }

      const activeRoom = rooms.find((r) => r.id === session.adminSelectedRoomId) || null;
      if (!activeRoom) {
        adminRoomEmptyState.classList.remove('hidden');
        adminRoomWorkspace.classList.add('hidden');
        DataService.unsubscribeAdmin();
        return;
      }

      adminRoomEmptyState.classList.add('hidden');
      adminRoomWorkspace.classList.remove('hidden');

      adminActiveRoomId.textContent = activeRoom.id;
      adminActiveRoomTitle.textContent = activeRoom.title ? `— ${activeRoom.title}` : '';
      tabCountQuestions.textContent = (activeRoom.questions || []).length;

      setAdminTab(session.adminTab);
      renderAdminQuestionList(activeRoom);
      await refreshActiveRoomStudents(activeRoom);

      if (DataService.isCloud && session.view === 'admin') {
        DataService.subscribeAdmin(activeRoom.id, () => {
          if (session.view === 'admin') {
            renderAdminDashboard();
          }
        });
      }
    } finally {
      isRenderingAdmin = false;
    }
  }

  async function refreshActiveRoomStudents(activeRoomArg = null) {
    const activeRoom = activeRoomArg || session.adminRoomsCache.find((r) => r.id === session.adminSelectedRoomId);
    if (!activeRoom) return;
    const students = await DataService.getRoomStudents(activeRoom.id);
    session.adminStudentsCache = students;
    tabCountStudents.textContent = students.length;
    renderAdminStudentTable(activeRoom, students);
  }

  function renderAdminQuestionList(room) {
    const listEl = document.getElementById('admin-question-list');
    listEl.innerHTML = '';
    const questions = room.questions || [];

    if (questions.length === 0) {
      listEl.innerHTML = '<div class="text-center py-8 text-slate-400 font-bold">Phòng này chưa có câu hỏi nào. Hãy thêm câu hỏi ở trên nhé!</div>';
      return;
    }

    const letters = ['A', 'B', 'C', 'D'];
    questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3';

      const answerSummary =
        q.type === 'multiple_choice'
          ? `Trắc nghiệm • Đáp án đúng: <span class="text-emerald-700">${letters[q.correctIndex]}. ${escapeHtml(q.options[q.correctIndex])}</span>`
          : `Điền đáp án • Đáp án đúng: <span class="text-emerald-700">${escapeHtml(q.correctAnswer)}</span>`;

      card.innerHTML = `
        <div class="space-y-1 flex-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">Cửa ${idx + 1}</span>
            <span class="text-xs font-bold text-slate-500">${answerSummary}</span>
          </div>
          <div class="font-bold text-slate-800 text-base">${escapeHtml(q.prompt)}</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" data-move-up="${idx}" ${idx === 0 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-35 text-xs font-bold cursor-pointer" title="Lên">⬆️</button>
          <button type="button" data-move-down="${idx}" ${idx === questions.length - 1 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-35 text-xs font-bold cursor-pointer" title="Xuống">⬇️</button>
          <button type="button" data-edit-q="${q.id}" class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold cursor-pointer">✏️ Sửa</button>
          <button type="button" data-delete-q="${q.id}" class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold cursor-pointer">🗑️ Xóa</button>
        </div>
      `;

      card.querySelector(`[data-move-up="${idx}"]`).addEventListener('click', async () => {
        if (idx === 0) return;
        const next = [...questions];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        await DataService.saveQuestions(room.id, next);
        await renderAdminDashboard();
      });

      card.querySelector(`[data-move-down="${idx}"]`).addEventListener('click', async () => {
        if (idx >= questions.length - 1) return;
        const next = [...questions];
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
        await DataService.saveQuestions(room.id, next);
        await renderAdminDashboard();
      });

      card.querySelector(`[data-edit-q="${q.id}"]`).addEventListener('click', () => {
        qEditId.value = q.id;
        qPrompt.value = q.prompt;
        qType.value = q.type;
        const isMc = q.type === 'multiple_choice';
        qMcFields.classList.toggle('hidden', !isMc);
        qSaFields.classList.toggle('hidden', isMc);
        if (isMc) {
          q.options.forEach((opt, i) => {
            document.getElementById(`q-opt-${i}`).value = opt;
          });
          const radio = document.querySelector(`input[name="q-correct-mc"][value="${q.correctIndex}"]`);
          if (radio) radio.checked = true;
        } else {
          qShortAnswer.value = q.correctAnswer || '';
        }
        questionFormHeading.textContent = `✏️ Chỉnh sửa câu hỏi (Cửa ${idx + 1})`;
        btnCancelEditQuestion.classList.remove('hidden');
        qPrompt.focus();
      });

      card.querySelector(`[data-delete-q="${q.id}"]`).addEventListener('click', async () => {
        if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
          const next = questions.filter((item) => item.id !== q.id);
          await DataService.saveQuestions(room.id, next);
          await renderAdminDashboard();
          showToast('Đã xóa câu hỏi!', 'info');
        }
      });

      listEl.appendChild(card);
    });
  }

  function renderAdminStudentTable(room, students) {
    const tbody = document.getElementById('admin-student-tbody');
    tbody.innerHTML = '';

    if (!room || students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-400 font-bold">
            Chưa có học sinh nào tham gia phòng ${room ? escapeHtml(room.id) : ''}.
          </td>
        </tr>
      `;
      return;
    }

    const totalDoors = (room.questions || []).length;
    students
      .slice()
      .sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0))
      .forEach((st) => {
        const isDone = st.status === 'completed';
        const progressLabel = isDone
          ? `Hoàn thành (${totalDoors}/${totalDoors})`
          : `Cửa ${Math.min(st.currentDoorIndex + 1, Math.max(totalDoors, 1))}/${totalDoors}`;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80';
        tr.innerHTML = `
          <td class="py-3 px-3 text-slate-800">${escapeHtml(st.name)}</td>
          <td class="py-3 px-3 font-mono text-xs text-indigo-700">${escapeHtml(st.userId)}</td>
          <td class="py-3 px-3 text-slate-700">${progressLabel}</td>
          <td class="py-3 px-3 text-center">
            <span class="px-2.5 py-0.5 rounded-full ${st.wrongCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'} text-xs font-extrabold">
              ${st.wrongCount}
            </span>
          </td>
          <td class="py-3 px-3">
            ${
              isDone
                ? '<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">✅ Đã hoàn thành</span>'
                : '<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">⏳ Đang chơi</span>'
            }
          </td>
          <td class="py-3 px-3 text-right">
            <button type="button" data-del-student="${escapeHtml(st.userId)}" class="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer">Xóa</button>
          </td>
        `;
        tr.querySelector(`[data-del-student="${st.userId}"]`).addEventListener('click', async () => {
          await DataService.deleteStudent(room.id, st.userId);
          await renderAdminDashboard();
        });
        tbody.appendChild(tr);
      });
  }

  window.addEventListener('storage', (e) => {
    if (!DataService.isCloud && e.key === STORAGE_KEY && session.view === 'admin') {
      renderAdminDashboard();
    }
  });
})();

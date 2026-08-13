with open('src/FloatingLiveOverlay.js') as f:
    content = f.read()

changes = 0

old_sim = """  // Simulasi real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['like', 'follow', 'share', 'gift'];
      const users = ['Budi_456', 'Maya_789', 'Andi_01', 'Citra_222'];
      const messages = [
        '❤️ Menyukai live Anda',
        '👥 Mulai mengikuti Anda',
        '📤 Membagikan live Anda',
        '🎁 Mengirim hadiah'
      ];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMsg = messages[types.indexOf(randomType)];

      const newNotif = {
        id: Math.random(),
        type: randomType,
        user: randomUser,
        text: randomMsg,
        time: 'Baru saja'
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);

      // Update stats
      if (randomType === 'like') {
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
      } else if (randomType === 'follow') {
        setStats(prev => ({ ...prev, viewers: prev.viewers + 1 }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update duration"""

new_sim = """  // Update duration"""

if old_sim in content:
    content = content.replace(old_sim, new_sim, 1)
    changes += 1
    print("BERHASIL: blok simulasi data palsu dihapus")
else:
    print("LEWAT: blok simulasi tidak ditemukan (mungkin sudah dihapus)")

old_icon = """            <Text style={styles.notifIcon}>
              {notif.type === 'like' && '❤️'}
              {notif.type === 'follow' && '👥'}
              {notif.type === 'share' && '📤'}
              {notif.type === 'gift' && '🎁'}
            </Text>"""

new_icon = """            <Text style={styles.notifIcon}>
              {notif.type === 'like' && '❤️'}
              {notif.type === 'follow' && '👥'}
              {notif.type === 'share' && '📤'}
              {notif.type === 'gift' && '🎁'}
              {notif.type === 'donation' && '💰'}
            </Text>"""

if old_icon in content:
    content = content.replace(old_icon, new_icon, 1)
    changes += 1
    print("BERHASIL: ikon donasi ditambahkan ke daftar notifikasi")
else:
    print("LEWAT: blok ikon notifikasi tidak ditemukan")

old_notif_handler = """    const unsubNotif = webSocketService.on('notification', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), type: data.type, user: data.user, text: data.text, time: 'Baru saja' },
        ...prev,
      ].slice(0, 20));
    });"""

new_notif_handler = """    const unsubNotif = webSocketService.on('notification', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: data.type,
          user: data.user,
          text: data.text,
          time: 'Baru saja',
          platform: data.platform || 'tiktok',
          amount: data.amount,
        },
        ...prev,
      ].slice(0, 20));

      if (data.type === 'donation' || data.type === 'gift') {
        setStats((prev) => ({ ...prev, gifts: prev.gifts + 1 }));
      }
    });"""

if old_notif_handler in content:
    content = content.replace(old_notif_handler, new_notif_handler, 1)
    changes += 1
    print("BERHASIL: handler notifikasi mendukung field platform & amount")
else:
    print("LEWAT: blok handler notifikasi tidak ditemukan")

if changes > 0:
    with open('src/FloatingLiveOverlay.js', 'w') as f:
        f.write(content)
    print(f"\nTOTAL: {changes} perubahan disimpan")
else:
    print("\nTIDAK ADA PERUBAHAN DISIMPAN")

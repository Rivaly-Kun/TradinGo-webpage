class ListPesan {
    createElement() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        // BIKIN DIV BARU DENGAN CLASS LIST CHAT
        this.element = document.createElement("div");
        this.element.classList.add("ListChat");
    }

    getUser() {
        rdb.ref('teman').once('value', (akun) => { // READ FRIENDS FOLDER
            this.element.innerHTML = ""; // BLANK THE CHAT LIST 
            if(akun.exists()) { // IF THERE IS A KEY IN THE FRIENDS FOLDER
                akun.forEach(data => { //READ EACH KEY
                        /* A LITTLE EXPLANATION!!
                        SO THERE WILL BE 2 POSSIBILITIES THAT WILL HAPPEN..
                        1. FRIEND KEY = USER ID & MY KEY = FRIEND ID
                        2. FRIEND KEY = FRIEND ID & MY KEY = USER ID
                        OUR POSITION AS A USER ID CAN BE A FRIEND ID FOR OTHER USERS
                        BUT IT CAN STILL BE USER ID FOR OTHER USERS
                        THEN WE WILL BREAK THE 2 POSSIBILITIES ON THE IF ELSE HERE
                    */
                    if(data.val().temanId === auth.currentUser.uid) { // case 1: IF THE FRIEND KEY IS THE SAME AS THE USER ID
                        rdb.ref("users").child(data.val().sayaId).once("value", (lain) => { //THEN READ MY KEY
                        const snap = lain.val();
                        this.list = document.createElement("div");
                        this.list.classList.add("kartu");
                        this.list.setAttribute("data-uid", lain.key)
                        this.list.innerHTML = (`
                        <div class="detail">
                        <img width="35" height="35" src="${snap.foto?snap.foto:snap.photo}" />
                            <div class="nama">
                            </div>
                        </div>
                        <div class="status ${snap.status ? snap.status : 'online'}">
                        ${snap.status ? snap.status : 'online'}</div>
                        `);
                        // SHOW KTIA CHATTING OPPONENT INFORMATION
                        this.list.querySelector(`.nama`).innerText = snap.nama ? snap.nama : snap.displayName;
                        this.element.prepend(this.list); // ENTER THE CHAT LIST
                        // THE LIST CARD LISTENER IS CLICKED
                        this.list.onclick = () => this.openChat(lain.key, snap.nama ? snap.nama : snap.displayName, snap.foto?snap.foto:snap.photo);
                    })
                } else if(data.val().sayaId === auth.currentUser.uid) { // Case 2: IF MY KEY IS THE SAME AS USER ID
                    rdb.ref("users").child(data.val().temanId).once("value", (lain) => { //THEN READ THE KEY FRIENDS
                        const snap = lain.val();
                        this.list = document.createElement("div");
                        this.list.classList.add("kartu");
                        this.list.setAttribute("data-uid", lain.key)
                        this.list.innerHTML = (`
                        <div class="detail">
                        <img width="35" height="35" src="${snap.foto?snap.foto:snap.photo}" />
                        <div class="nama">
                        </div>
                        </div>
                        <div class="status ${snap.status ? snap.status : 'online'}">
                        ${snap.status ? snap.status : 'online'}</div>
                        `);
                        // SHOW KTIA CHATTING OPPONENT INFORMATION
                        this.list.querySelector(`.nama`).innerText = snap.nama ? snap.nama : snap.displayName;
                        this.element.prepend(this.list); //ENTER THE CHAT LIST
                        // THE LIST CARD LISTENER IS CLICKED
                        this.list.onclick = () => this.openChat(lain.key, snap.nama ? snap.nama : snap.displayName, snap.foto?snap.foto:snap.photo);
                        })
                    } else { // OTHER THAN THE 2 CASES MENTIONED, DO NOT DO ANYTHING
                    }
                })
            }
            this.habis(); // SHOW AFTER LAST CARD
        })
    }

    habis() {
        this.noMore = document.createElement("div");
        this.noMore.classList.add("nomore");
        this.noMore.innerHTML = this.selang.list_pesan.nomore;
        
        // DIV BARU UNTUK TOMBOL CHAT GLOBAL
        this.global = document.createElement("div");
        this.global.classList.add("tombol");
        this.global.setAttribute("data-global", auth.currentUser.uid);
        this.global.innerHTML = (`
            <button class="btn-1 hijau create"><i class="fa-light fa-globe"></i> GLOBAL CHAT</button>
        `)

        // MASUKIN 2 DIV KE LIST CHAT
        this.element.appendChild(this.noMore);
        this.element.appendChild(this.global);
        // LISTENER TOMBOL CHAT GLOBAL DIKLIK
        this.global.onclick = () => new Global().init(document.querySelector(".container"));
    }

    refreshUser() {
        const container = document.querySelector(".container");
        // GANTI LIST SEBELUMNYA MENJADI LIST TERBARU APABILA ADA DATA YANG BERUBAH
        rdb.ref("users").on("child_changed", () => {
            this.element.remove();
            this.createElement();
            this.getUser();
            container.appendChild(this.element);
        });
    }

    openChat(uid, nama, foto) {
        // TUTUP ELEMENT INI
        this.close();
        // JALANKAN INSTANCE PESANNYA
        this.pesan = new Pesan({
            uid: uid,
            nama: nama,
            foto: foto
        });
        // SISIPKAN CONTAINER KE DALAM INIT -- PARAMETER --
        this.pesan.init(document.querySelector(".container"));
    }

    navbar(container) {
        container.querySelector(".navbar .pesan").classList.add("active");
    }

    state() {
        // PUSH KE USERSTATE
        userState.changeLast("listChat");
        // SIMPAN KE LOCALSTORAGE
        new Activity().save();
    }

    close() {
        // HAPUS LIST CHAT
        if(this.element) {this.element.remove()};
        // MATIKAN USER REF
        rdb.ref("users").off();
    }

    init(container) {
        new Landing().end();
        // BIKIN HEADER DAN NAVBAR
        new Dashboard().createElement();
        // GANTI HIGHLIGHT NAVBAR
        this.navbar(container);
        // BIKIN DIV BARU
        this.createElement();
        // AMBIL DATA USER
        this.getUser();
        // JALANKAN PENDETEKSI JIKA ADA DATA YANG BERUBAH
        this.refreshUser();
        // MASUKKAN DIV BARU KE CONTAINER
        container.appendChild(this.element);
        // LETAKKAN DI USERSTATE
        this.state()
    }
}
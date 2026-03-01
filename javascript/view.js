"use strict";

export const View = {
  selectors: {
    settingsBtn: '.main-header__setting-btn',
    drawerSettings: '.drawer--settings',
    drawerCloseBtn: '.drawer__close-btn'
  },

  // Elementノードを格納していくもの（オブジェクトのようなもの）
  el: {},

  init() {
    // selectorsにあるキー（settingsBtnなど）をループして自動取得
    Object.keys(this.selectors).forEach(key => {
      this.el[key] = document.querySelector(this.selectors[key]);
    });

    this.toggleSettingsDrawerMenu();
  },
  // 設定メニューの開閉制御
  toggleSettingsDrawerMenu() {
    this.el.settingsBtn?.addEventListener('click', () => {
      if (this.el.drawerSettings?.open) {
        this.el.drawerSettings.close();
      } else {
        this.el.drawerSettings?.showModal();
      }
    });

    this.el.drawerCloseBtn?.addEventListener('click', () => this.el.drawerSettings?.close());

    // ダイアログ以外をクリックしたら閉じる処理
    this.el.drawerSettings?.addEventListener('click', (e) => {
      if (e.target === this.el.drawerSettings) {
        this.el.drawerSettings.close();
      }
    });
  }
};

const selectDueDate = () => {
  const CARD_DUE_DATE_BTN = '.card__due-date-btn';
  const dueDate = document.querySelector('.card__due-date-value');

  // DateTimePickerの設定（外部ライブラリ）
  flatpickr(CARD_DUE_DATE_BTN, {
    local: 'ja',
    dateFormat: 'Y-m-d',
    onChange: (selectedDates, dateStr) => {
      const [year, month, day] = dateStr.split('-');

      dueDate.textContent = `${year}年${month}月${day}日`;
      // date-time属性に日付を設定
      dueDate.dateTime = dateStr;
    }

  });
}

selectDueDate();






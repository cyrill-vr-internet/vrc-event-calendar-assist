window.addEventListener("load", (event) => {
  reloadPreset();

  FormPersistence.load(document.getElementById('event-form'), { uuid: document.getElementById("event-uuid").value });

  let params = new URLSearchParams(document.location.search);
  if (params.get("json")) {
    newForm();
    importData(params.get("json"));
  }
});

function generateURL() {
  let url = URI(location.href);
  params = formParams();
  params.push(["event-start", document.getElementById("event-start").value]);
  params.push(["event-end", document.getElementById("event-end").value]);

  document.getElementById("export-url").value = url.query({ json: JSON.stringify(params) }).toString();
}

function importData(json) {
  params = new Map(JSON.parse(json));

  map = [
    ["entry.1319903296", "event-name"],
    ["entry.1354615990", "event-owner"],
    ["entry.402615171", "event-description"],
    ["entry.1470688692", "event-rule"],
    ["entry.43975396", "event-howtojoin"],
    ["entry.131997623", "event-remark"],
    ["entry.1957263813", "event-x-message"],
    ["event-start", "event-start"],
    ["event-end", "event-end"],
  ]
  for (let i = 0; i < map.length; i++) {
    document.getElementById(map[i][1]).value = params.get(map[i][0]);
  }
  setSelectedRadioElement("event-platform", params.get("entry.412548841"));

  let event_genre = document.getElementsByName("event-genre");
  let selected_event_genres = params.get("entry.1923252134");
  for (let i = 0; i < event_genre.length; i++) {
    if (selected_event_genres.includes(event_genre[i].value)) {
      event_genre[i].checked = true;
    }
  }
  if (params.get("entry.686419094") != "") {
    document.getElementById("event-abroad-message-0").checked = true;
  }
}

function reloadPreset() {
  const se = localStorage.getItem("vrc_event_calendar_events");
  window.storedEvents = new Map();

  let select_elem = document.getElementById("stored-events");
  select_elem.textContent = '';

  select_elem.addEventListener('change', function () {
    let selectedOption = this.options[this.selectedIndex];
    document.getElementById("event-uuid").value = selectedOption.id;
    FormPersistence.load(document.getElementById('event-form'), { uuid: document.getElementById("event-uuid").value });
  });

  if (se != null) {
    window.storedEvents = new Map(JSON.parse(se))
  }

  if (window.storedEvents.size == 0) {
    let option = document.createElement('option');
    option.innerText = "(保存済みデータがありません)";
    select_elem.appendChild(option);

    uuid_elem = document.getElementById("event-uuid");
    uuid_elem.value = UUID.generate();
    return;
  }

  for (const [key, value] of window.storedEvents) {
    let option = document.createElement('option');
    option.innerText = `${value[0]} / ${value[1]}`;
    option.id = key;
    select_elem.appendChild(option);
  }
  let options = document.getElementById("stored-events").options
  document.getElementById("event-uuid").value = options[options.selectedIndex].id;
}

function saveForm() {
  let data = [document.getElementById('event-name').value, (new Date).toString()];
  window.storedEvents.set(
    document.getElementById('event-uuid').value,
    data
  );
  localStorage.setItem("vrc_event_calendar_events", JSON.stringify(Array.from(window.storedEvents.entries())));
  FormPersistence.save(document.getElementById('event-form'), { uuid: document.getElementById("event-uuid").value });

  let options = document.getElementById("stored-events").options
  let option = options[options.selectedIndex];
  option.innerText = data.join(" / ");
}

function newForm() {
  document.getElementById('event-form').reset();
  uuid_elem = document.getElementById("event-uuid");
  uuid_elem.value = UUID.generate();
  document.getElementById('event-name').value = "新規イベント";
  saveForm();

  let data = [document.getElementById('event-name').value, (new Date).toString()];
  let option = document.createElement('option');
  option.innerText = data.join(" / ");
  option.id = uuid_elem.value;
  document.getElementById("stored-events").appendChild(option)
  let options = document.getElementById("stored-events").options
  options[options.length - 1].selected = true;
}

function deletePreset() {
  window.storedEvents.delete(document.getElementById('event-uuid').value);
  localStorage.setItem("vrc_event_calendar_events", JSON.stringify(Array.from(window.storedEvents.entries())));
  reloadPreset();
  let options = document.getElementById("stored-events").options
  options[options.length - 1].selected = true;
  FormPersistence.load(document.getElementById('event-form'), { uuid: document.getElementById("event-uuid").value });
}

function setSelectedRadioElement(name, value) {
  let elements = document.getElementsByName(name);
  for (let i = 0; i < elements.length; i++) {
    if (elements.item(i).value == value) {
      elements.item(i).checked = true;
    }
  }
}

function getSelectedRadioElement(name) {
  let elements = document.getElementsByName(name);
  let selected = "";
  for (let i = 0; i < elements.length; i++) {
    if (elements.item(i).checked) {
      selected = elements.item(i).value;
    }
  }
  return selected;
}

function getSelectedOptionElement(id) {
  return document.getElementById(id).selectedOptions[0].value;
}

function getDayOfWeek(nextWeek, targetDay) {
  const today = new Date();
  const currentDay = today.getDay(); // 0:日曜日
  const dayDifference = (targetDay + 7 - currentDay) % 7; // 次の曜日までの日数を計算

  // 今日が指定の曜日なら今日をセット
  today.setDate(today.getDate() + (dayDifference === 0 ? 0 : dayDifference) + (nextWeek * 7));
  return today;
}

function getDayOfMonth(nextMonth, targetDate) {
  const today = new Date();
  today.setDate(targetDate);
  today.setMonth(today.getMonth() + nextMonth);
  return today;
}

function zeroPadding(NUM, LEN) {
  return (Array(LEN).join('0') + NUM).slice(-LEN);
}

function buildLinks(lists) {
  const form_url = "https://docs.google.com/forms/d/e/1FAIpQLSfJlabb7niRTf4rX2Q0wRc3ua9MuOEIKveo7NirR6zuOo6D9A/viewform";
  let form_params = formParams();

  let links = [];
  for (let i = 0; i < lists.length; i++) {
    let params = form_params;
    params.push(["entry.1310854397", lists[i][0]]); // start
    params.push(["entry.2042374434", lists[i][1]]); // end
    links.push(URI(form_url).query(Object.fromEntries(new Map(params))));
  }
  return links;
}

function formParams() {
  let event_platform_selected = getSelectedRadioElement("event-platform");
  let event_genre = document.getElementsByName("event-genre");
  let selected_event_genres = [];
  for (let i = 0; i < event_genre.length; i++) {
    if (event_genre[i].checked) {
      selected_event_genres.push(event_genre[i].value);
    }
  }

  let event_abroad_message_elem = document.getElementById("event-abroad-message-0");
  let event_abroad_message = event_abroad_message_elem.checked ? event_abroad_message_elem.value : "";

  return [
    ["entry.1319903296", document.getElementById("event-name").value],
    ["entry.1354615990", document.getElementById("event-owner").value],
    ["entry.402615171", document.getElementById("event-description").value],
    ["entry.1470688692", document.getElementById("event-rule").value],
    ["entry.43975396", document.getElementById("event-howtojoin").value],
    ["entry.131997623", document.getElementById("event-remark").value],
    ["entry.1957263813", document.getElementById("event-x-message").value],
    ["entry.412548841", event_platform_selected],
    ["entry.1923252134", selected_event_genres],
    ["entry.686419094", event_abroad_message],
    // --- 固定
    ["entry.1704463647", "イベントを登録する"],
  ];
}

function buildWeeklyTargetDateLists(n) {
  let today = new Date();
  let event_day_of_week = parseInt(getSelectedOptionElement("events-day-of-week"));
  let event_start = document.getElementById("event-start").value;
  let event_end = document.getElementById("event-end").value;
  // イベント開始時間が現在時刻よりも前の場合来週からにする
  let initDelta = (event_day_of_week == today.getDay()
    && parseInt(event_start.replace(":", "")) <= today.getHours() * 100 + today.getMinutes()) ? 1 : 0;
  let lists = [];
  // n個分の対象日を生成し、同じ時間をセットしてURLを作成
  for (let i = 0; i < n; i++) {
    let targetDate = getDayOfWeek(i + initDelta, parseInt(getSelectedOptionElement("events-day-of-week")));
    let targetDateFormated = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`
    let startDatetime = `${targetDateFormated} ${event_start}`
    let endDatetime = `${targetDateFormated} ${event_end}`
    lists.push([startDatetime, endDatetime]);
  }
  return lists;
}

function buildMonthlyTargetDateLists(n) {
  let today = new Date();
  let every_month_day = document.getElementById("every_month_day").value;
  let event_start = document.getElementById("event-start").value;
  let event_end = document.getElementById("event-end").value;
  // イベント開始時間が現在時刻よりも前の場合来月からにする
  let initDelta = 0;
  if (every_month_day < today.getDate()) {
    initDelta = 1;
  } else if (every_month_day == today.getDate()
    && parseInt(event_start.replace(":", "")) <= today.getHours() * 100 + today.getMinutes()) {
    initDelta = 1;
  }

  let lists = [];
  // n個分の対象日を生成し、同じ時間をセットしてURLを作成
  for (let i = 0; i < n; i++) {
    let targetDate = getDayOfMonth(i + initDelta, every_month_day);
    let targetDateFormated = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`
    let startDatetime = `${targetDateFormated} ${event_start}`
    let endDatetime = `${targetDateFormated} ${event_end}`
    lists.push([startDatetime, endDatetime]);
  }
  return lists;
}

function updateBuiltLinks(links) {
  document.getElementById("built-links").innerHTML = "";
  for (let i = 0; i < links.length; i++) {
    let div = document.createElement("div");
    let anchor = document.createElement("a");
    anchor.href = links[i];
    anchor.innerText = `リンク${i + 1}`;
    anchor.target = "_blank";
    div.className = "built-link";
    div.appendChild(anchor);
    document.getElementById("built-links").appendChild(div);
  }
}
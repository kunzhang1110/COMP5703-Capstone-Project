var all_smalls = document.getElementsByTagName('small');
var duration_list = [];
Array.from(all_smalls).forEach((item) => {
  duration_list.push(item.innerHTML);
}
);
duration_list;

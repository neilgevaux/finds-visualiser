async function loadJsonData() {
  const finds = await fetch('finds_data.json');
  const data = await finds.json();
  return data.filter(d => d.Type);

}

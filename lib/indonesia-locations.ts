type Coordinate = readonly [longitude: number, latitude: number];

const CITY_COORDINATES: Record<string, Coordinate> = {
  ambon: [128.1814, -3.6954],
  balikpapan: [116.8529, -1.2379],
  bandaaceh: [95.3238, 5.5483],
  bandarlampung: [105.2667, -5.45],
  bandung: [107.6191, -6.9175],
  banjarmasin: [114.5908, -3.3186],
  batam: [104.0305, 1.0456],
  bekasi: [106.9924, -6.2383],
  bengkulu: [102.2655, -3.7928],
  bogor: [106.806, -6.5971],
  denpasar: [115.2126, -8.6705],
  depok: [106.7942, -6.4025],
  gorontalo: [123.0595, 0.5435],
  jakarta: [106.8456, -6.2088],
  jayapura: [140.7181, -2.5916],
  kendari: [122.512, -3.9985],
  kupang: [123.607, -10.1772],
  labuanbajo: [119.8877, -8.4964],
  makassar: [119.4327, -5.1477],
  malang: [112.6304, -7.9666],
  mamuju: [118.8885, -2.6806],
  manado: [124.8421, 1.4748],
  mataram: [116.1005, -8.5833],
  medan: [98.6722, 3.5952],
  merauke: [140.3946, -8.4991],
  padang: [100.3543, -0.9471],
  palangkaraya: [113.9213, -2.2161],
  palembang: [104.7754, -2.9761],
  palu: [119.8707, -0.9003],
  pangkalpinang: [106.1096, -2.1316],
  pekanbaru: [101.4478, 0.5071],
  pontianak: [109.3425, -0.0263],
  samarinda: [117.1436, -0.5016],
  semarang: [110.4203, -6.9932],
  serang: [106.1503, -6.1201],
  sorong: [131.261, -0.8762],
  sukabumi: [106.927, -6.9277],
  surabaya: [112.7521, -7.2575],
  surakarta: [110.8279, -7.5755],
  tangerang: [106.6409, -6.1783],
  tanjungpinang: [104.455, 0.9186],
  tarakan: [117.6333, 3.3],
  ternate: [127.3772, 0.7893],
  yogyakarta: [110.3695, -7.7956],
};

const PROVINCE_COORDINATES: Record<string, Coordinate> = {
  aceh: [96.7494, 4.6951],
  bali: [115.1889, -8.4095],
  banten: [106.064, -6.4058],
  bengkulu: [102.3464, -3.5778],
  gorontalo: [123.0568, 0.6999],
  jakarta: [106.8456, -6.2088],
  jambi: [102.4381, -1.4852],
  jawabarat: [107.6689, -7.0909],
  jawatengah: [110.1403, -7.151],
  jawatimur: [112.2384, -7.5361],
  kalimantanbarat: [111.4753, -0.2788],
  kalimantanselatan: [115.2838, -3.0926],
  kalimantantengah: [113.3824, -1.6815],
  kalimantantimur: [116.4194, 0.5387],
  kalimantanutara: [116.8945, 3.0731],
  kepulauanbangkabelitung: [106.4406, -2.7411],
  kepulauanriau: [104.4508, 3.9457],
  lampung: [105.4068, -4.5586],
  maluku: [130.1453, -3.2385],
  malukuutara: [127.8088, 1.5709],
  nusatenggarabarat: [117.3616, -8.6529],
  nusatenggaratimur: [121.0794, -8.6574],
  papua: [138.0804, -4.2699],
  papuabarat: [133.1747, -1.3361],
  riau: [101.7068, 0.2933],
  sulawesibarat: [119.2321, -2.8441],
  sulawesiselatan: [120.1303, -3.6688],
  sulawesitengah: [121.2011, -1.4300],
  sulawesitenggara: [122.1746, -4.1449],
  sulawesiutara: [124.8034, 0.6247],
  sumaterabarat: [100.8000, -0.7399],
  sumateraselatan: [103.9144, -3.3194],
  sumaterautara: [99.5451, 2.1154],
  yogyakarta: [110.4262, -7.8754],
};

function normalize(value: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\b(kota|kabupaten|provinsi|daerah khusus ibukota|daerah istimewa)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function cityJitter(city: string) {
  let hash = 0;
  for (const character of city) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return [(hash % 11) * 0.045, ((hash >> 3) % 9) * 0.035] as const;
}

export function resolveIndonesiaCoordinate(city: string, province: string | null) {
  const cityKey = normalize(city);
  const cityCoordinate = CITY_COORDINATES[cityKey];
  if (cityCoordinate) return cityCoordinate;

  const provinceCoordinate = PROVINCE_COORDINATES[normalize(province)];
  if (!provinceCoordinate) return null;

  const [longitudeJitter, latitudeJitter] = cityJitter(cityKey);
  return [provinceCoordinate[0] + longitudeJitter, provinceCoordinate[1] + latitudeJitter] as const;
}

export function projectIndonesiaCoordinate([longitude, latitude]: Coordinate) {
  return {
    x: ((longitude - 94) / (142 - 94)) * 1000,
    y: ((7 - latitude) / (7 - (-12))) * 390,
  };
}

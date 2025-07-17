function formatRupiah(num) {
  return 'Rp ' + (num||0).toLocaleString('id-ID');
}

document.addEventListener('DOMContentLoaded', function() {
  // Total PO
  const poList = JSON.parse(localStorage.getItem('poList')||'[]');
  document.getElementById('cardTotalPO').textContent = poList.length;

  // Total Pembelian Plat (AP)
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  let totalPembelian = 0;
  apList.forEach(ap => { totalPembelian += ap.total || ap.nominal || 0; });
  document.getElementById('cardTotalPembelian').textContent = formatRupiah(totalPembelian);

  // Total AR (Piutang)
  const invoiceList = JSON.parse(localStorage.getItem('invoiceList')||'[]');
  let totalAR = 0;
  invoiceList.forEach(inv => {
    const pembayaran = (inv.pembayaran||[]).reduce((a,b)=>a+b,0);
    const sisa = (inv.total||0) - pembayaran;
    if (sisa > 0) totalAR += sisa;
  });
  document.getElementById('cardTotalAR').textContent = formatRupiah(totalAR);

  // Total AP (Hutang)
  let totalAP = 0;
  apList.forEach(ap => { totalAP += ap.total || ap.nominal || 0; });
  document.getElementById('cardTotalAP').textContent = formatRupiah(totalAP);

  // Recent Activity (ambil 10 terakhir dari PO, AP, Invoice)
  let activities = [];
  poList.forEach(po => {
    activities.push({date: po.tanggal || po.date || po.createdAt || '-', text: `PO baru: <b>${po.noPO||'-'}</b> (${po.jenis||''})`});
  });
  apList.forEach(ap => {
    activities.push({date: ap.tanggal || '-', text: `Pembelian plat: <b>${ap.vendor||'-'}</b> (${formatRupiah(ap.total||ap.nominal)})`});
  });
  invoiceList.forEach(inv => {
    activities.push({date: inv.tanggal || '-', text: `Invoice: <b>${inv.noInvoice||'-'}</b> (Total ${formatRupiah(inv.total)})`});
  });
  activities = activities.filter(a=>a.date&&a.date!=='-').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  const ul = document.getElementById('recentActivity');
  ul.innerHTML = '';
  if (activities.length === 0) {
    ul.innerHTML = '<li>Tidak ada aktivitas terbaru.</li>';
  } else {
    activities.forEach(act => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color:#888;font-size:0.97em;">${act.date}</span> &mdash; ${act.text}`;
      ul.appendChild(li);
    });
  }
}); 
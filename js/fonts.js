/* Free Google Fonts available in the website and the dashboard. */
window.SITE_FONTS = {
  list: [
    { name: "Cormorant Garamond", kind: "Serif", stack: '"Cormorant Garamond", Georgia, "Times New Roman", serif', gf: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500" },
    { name: "Playfair Display", kind: "Serif", stack: '"Playfair Display", Georgia, "Times New Roman", serif', gf: "Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500" },
    { name: "Lora", kind: "Serif", stack: 'Lora, Georgia, "Times New Roman", serif', gf: "Lora:ital,wght@0,400;0,500;0,600;1,400;1,500" },
    { name: "Libre Baskerville", kind: "Serif", stack: '"Libre Baskerville", Georgia, "Times New Roman", serif', gf: "Libre+Baskerville:ital,wght@0,400;0,700;1,400" },
    { name: "Jost", kind: "Sans-serif", stack: 'Jost, "Helvetica Neue", Arial, sans-serif', gf: "Jost:wght@300;400;500" },
    { name: "Inter", kind: "Sans-serif", stack: 'Inter, "Helvetica Neue", Arial, sans-serif', gf: "Inter:wght@300;400;500;600" },
    { name: "DM Sans", kind: "Sans-serif", stack: '"DM Sans", "Helvetica Neue", Arial, sans-serif', gf: "DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400" },
    { name: "Montserrat", kind: "Sans-serif", stack: 'Montserrat, "Helvetica Neue", Arial, sans-serif', gf: "Montserrat:wght@300;400;500;600" },
    { name: "Open Sans", kind: "Sans-serif", stack: '"Open Sans", "Helvetica Neue", Arial, sans-serif', gf: "Open+Sans:wght@300;400;500;600" }
  ],
  // Already loaded by every page's <head>; no extra download needed.
  builtIn: ["Cormorant Garamond", "Jost"],
  find: function (name) {
    for (var i = 0; i < this.list.length; i++) if (this.list[i].name === name) return this.list[i];
    return null;
  },
  stack: function (name) { var f = this.find(name); return f ? f.stack : null; },
  url: function (names) {
    var self = this, parts = [];
    names.forEach(function (n) { var f = self.find(n); if (f && parts.indexOf(f.gf) < 0) parts.push(f.gf); });
    return parts.length ? 'https://fonts.googleapis.com/css2?family=' + parts.join('&family=') + '&display=swap' : '';
  }
};

module.exports = {
  apps : [{
    name: 'Iron Land Bot',
    script: 'index.js',
    watch: 'true',
    ignore_watch : ["output_files"],
    autorestart: true,
    max_memory_restart: "256MB"
  }]
};

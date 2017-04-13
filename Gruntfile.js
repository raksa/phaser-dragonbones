module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default : {
        src: ["src/*"],
        out: "built/PhaserBones.js"
      }
    },
    clean: ["built"]
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask("build", ["clean", "ts"]);
};
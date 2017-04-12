module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default : {
        src: ["PhaserBones.ts"],
        outDir: "built"
      }
    }
  });
  grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask("build", ["ts"]);
};
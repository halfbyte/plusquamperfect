require 'versions2html'
require 'erb'
require 'haml'

task :default => [:build]

task :build do
  template = File.read(File.join(File.dirname(__FILE__), "slides.haml"))
  haml_engine = Haml::Engine.new(template)
  slides = haml_engine.render

  versions = PlusQuamPerfect::VersionsRenderer.new(File.join(File.dirname(__FILE__), "rails_versions.yaml")).render

  erb = ERB.new(File.read(File.join(File.dirname(__FILE__), "template.html.erb")))
  File.open(File.join(File.dirname(__FILE__), "preso.html"), "w") do |file|
    file.write erb.result(binding)
  end
  
  
  
  
end
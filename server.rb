#!/usr/bin/env ruby
require 'webrick'
require 'erb'
require 'yaml'

include WEBrick

s = HTTPServer.new(
  :Port => 3000,
  :DocumentRoot => File.join(Dir.pwd, "pqp")
)
index_proc = lambda do |req, resp|

  erb = ERB.new(File.read(File.join(Dir.pwd, "template.html.erb")))

  versions = ""
  versions_yaml = YAML.load_file(File.join(Dir.pwd, "rails_versions.yaml"))
  unique_dates = []
  sorted_versions = versions_yaml.sort{ |a,b| a.last['date'] <=> b.last['date'] }

  sorted_versions.each do |v|
    tag = v.first
    data = v.last
    date = data['date']
    unique_date = date.strftime('%Y-%m-%d')
    while unique_dates.include?(unique_date) do
      unique_date << "-01"
    end
    unique_dates << unique_date
    versions << <<-END
  <div class="date version" id="date-#{unique_date}">
    <h2>Rails #{tag}</h2>
    <p>#{date.strftime("%d.%m.%Y")}</p>
  END
    if data['subtitle']
      versions << "  <p>#{data['subtitle']}</p>"
    end
    if data['url']
      versions << "  <div class='footnotes'><a href='#{data['url']}'>#{data['url']}</a></div>"
    end
    versions << "</div>"
  end

  slides = ""
  slides_yaml = YAML.load_file(File.join(Dir.pwd, "events.yaml"))
  unique_dates = []
  sorted_slides = slides_yaml.sort{ |a,b| a.last['date'] <=> b.last['date'] }

  sorted_slides.each do |v|
    tag = v.first
    data = v.last
    date = data['date']
    unique_date = date.strftime('%Y-%m-%d')
    while unique_dates.include?(unique_date) do
      unique_date << "-01"
    end
    unique_dates << unique_date
    hold = data['hold'] ? "hold" : ""
    slides << <<-END
  <div class="date #{hold}" id="date-#{unique_date}">
    <h2>#{data['title']}</h2>
    <p>#{date.strftime("%d.%m.%Y")}</p>
  END
    if data['subtitle']
      slides << "  <p>#{data['subtitle']}</p>"
    end
    
    if data['description']
      case(data['description'].class)
      when Array
        data['description']
      else
        slides << "<p>#{data['description']}</p>"
      end
    end
    
    if data['url']
      slides << "  <div class='footnotes'><a href='#{data['url']}'>#{data['url']}</a></div>"
    end
    slides << "</div>"
  end



  resp['Content-Type'] = "text/html"
  resp.body = erb.result(binding)
  
end

index = HTTPServlet::ProcHandler.new(index_proc)

s.mount("/hello", index)

trap("INT") { s.shutdown }

s.start


require 'yaml'



versions = YAML.load_file(ARGV[0])
unique_dates = []
sorted_versions = versions.sort{|a,b| a.last['date'] <=> b.last['date']}
puts "<!-- #{sorted_versions.size} entries -->"
sorted_versions.each do |v|
  tag = v.first
  data = v.last
  
  date = data['date']
  unique_date = date.strftime('%Y-%m-%d')

  while unique_dates.include?(unique_date) do
    unique_date << "-01"
  end
  unique_dates << unique_date
  
  puts <<-END
<div class="date hold" id="date-#{unique_date}">
  <h2>Rails #{tag}</h2>
  <p>#{date.strftime("%d.%m.%Y")}</p>
END

  if data['subtitle']
    puts "  <p>#{data['subtitle']}</p>"
  end
  if data['url']
    puts "  <div class='footnotes'><a href='#{data['url']}'>#{data['url']}</a></div>"
  end
  puts "</div>"
  
end

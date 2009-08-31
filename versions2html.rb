require 'yaml'

module PlusQuamPerfect
  class VersionsRenderer
    def initialize(filename)
      versions = YAML.load_file(filename)
      unique_dates = []
      @versions = versions.sort{|a,b| a.last['date'] <=> b.last['date']}
    end
    
    
    def render
      versions = ""
      unique_dates = []

      @versions.each do |v|
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
      return versions
    end
  end
end
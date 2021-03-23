
class LogsAnalytics {
  static config = {
    regular: {
      regex: /^(\\x1B\[\d+m)*\[(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+\sCET\]\s+\[(?<severity>\w+)\](?<message>.*)$/,
      // highlight:{
      //   timestamp: {
      //     regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+\sCET/,
      //     color: "blue"
      //   },
      //   severity: {
      //     regex: /\w+/,
      //     color: "orante"
      //   }
      // }
    },
    jobid: {
      regex: /^\[(?<severity>\w+)\]\s+\[#(?<job>\d+)\]$/,
      message: function(values){
        return "Job: #" + values.job
      }
    },
    colorized_regular: {
      regex: /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3,4})\s+(?<severity>\w)\s+(?<component>[\w\d_\-\.]+):(?<line>\d+)\s+(?<message>.*)$/,
      severity: function(v){
        switch(v){
          case "I": return "info"
          case "D": return "debug"
          case "W": return "warning"
          case "E": return "error"
          default:
            return "info"
        }
      }
    }
  }

  constructor(logText){
    this.process(logText)
  }

  process(logText){
    let lines = logText.split("\n")

    let lastTimestamp = undefined
    let lastMatch = undefined
    let logs = []
    let initial = []

    lines.forEach(line => {
      var result = null

      for (var type in LogsAnalytics.config){
        let conf = LogsAnalytics.config[type]
        result = line.match(conf.regex)
        if (result !== null){
          result.conf = conf
          break;
        }
      }

      if (result !== null){
        let entry = result.groups
        entry.$type = type
        entry.$line = result.input

        if (entry.timestamp !== undefined){
          entry.timestamp = moment(result.groups.timestamp)
          lastTimestamp = entry.timestamp
        }
        else
          entry.timestamp = lastTimestamp

        if (entry.severity === undefined)
          entry.severity = "debug"
        else
          if (result.conf.severity !== undefined)
            entry.severity = result.conf.severity(entry.severity)

        switch(entry.severity){
          case "debug":
            entry.numericSeverity = 1
            break
          case "info":
            entry.numericSeverity = 2
            break
          case "warning":
            entry.numericSeverity = 3
            break
          case "error":
            entry.numericSeverity = 4
            break
          case "critical":
            entry.numericSeverity = 5
            break
        }
        
        if (entry.message === undefined){
          if (result.conf.message !== undefined)
            entry.message = result.conf.message(entry)
          else
            entry.message = line
        }

        entry.$pos = logs.length

        lastMatch = entry
        logs.push(entry)
      }
      else
        if (lastMatch !== undefined){
          if (lastMatch.extra_lines === undefined)
            lastMatch.extra_lines = [line]
          else
            lastMatch.extra_lines.push(line)
        }
        else
          initial.push(line)
    })

    this.logs = logs
    this.initialLogs = initial
  }

  filter(filters){
    if (!Array.isArray(filters))
      return this.filter([filters])

    return this.logs.filter( entry =>{
      let res = true
      for (let i in filters){
        res &= filters[i](entry)
        if (!res)
          break
      }

      return res
    })
  }
}

console.log("LogsAnalytics loaded")
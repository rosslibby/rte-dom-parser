import Blocks from './blocks.mjs'

const createElement = name => {
  let elementName

  switch(name) {
    case 'header-one':
      elementName = 'h1'
      break
    case 'header-two':
      elementName = 'h2'
      break
    case 'header-three':
      elementName = 'h3'
      break
    case 'header-four':
      elementName = 'h4'
      break
    case 'header-five':
      elementName = 'h5'
      break
    case 'header-six':
      elementName = 'h6'
      break
    default:
      elementName = name
      break
  }

  return `<${elementName}></${elementName}>`
}

const style = (element, styling) => {

}

const parser = blocks => {
  const dom = blocks.map((block, i) => {
    const { text, type, inlineStyleRanges } = block
    const styledItems = []
    const element = createElement(type)

    /**
     * Set the DOM element's text content
     */
    // element.innerText = text

    /**
     * Style the content within the DOM element
     */
    inlineStyleRanges.forEach(item => {
      if (item.style === 'ITALIC') {
        styledItems.push({
          styling: ['font-style: italic'],
          offset: item.offset,
          length: item.length
        })
      } else if (item.style === 'BOLD') {
        styledItems.push({
          styling: ['font-weight: bold'],
          offset: item.offset,
          length: item.length
        })
      } else if (item.style === 'UNDERLINE') {
        styledItems.push({
          styling: ['text-decoration: underline'],
          offset: item.offset,
          length: item.length
        })
      } else if (item.style.indexOf('Foreground_') === 0) {
        styledItems.push({
          styling: [`color: #${item.style.split('_')[1]}`],
          offset: item.offset,
          length: item.length
        })
      }
    })

    /**
     * Condense any overlapping styles
     */
    const condensedStyles = []
    styledItems.forEach(item => {
      const existingSelection = condensedStyles.findIndex(style => style.offset === item.offset && style.length === item.length)

      if (existingSelection > -1) {
        condensedStyles[existingSelection].styling.push(item.styling[0])
      } else {
        condensedStyles.push(item)
      }
    })

    /**
     * Go through the text and split it
     * according to styling offsets
     */
    const textNodeRanges = []
    condensedStyles.forEach((item, i) => {
      if (i === 0 && item.offset !== 0) {
        textNodeRanges.push({start: 0, end: item.offset})
      } else if (i !== 0 && item.offset > textNodeRanges[textNodeRanges.length - 1].end) {
        textNodeRanges.push({start: textNodeRanges[textNodeRanges.length - 1].end, end: item.offset})
      }
      textNodeRanges.push({start: item.offset, end: item.offset + item.length})

      if (i === condensedStyles.length - 1 && item.offset + item.length < text.length - 1) {
        textNodeRanges.push({start: item.offset + item.length, end: text.length - 1})
      }
    })

    /**
     * Build the dom
     */
    const domNodes = textNodeRanges.map(node => ({
      ...node,
      text: text.substring(node.start, node.end)
    })).map(node => {
      const condensedStyle = condensedStyles.find(style => style.offset === node.start && style.length === node.end - node.start)

      if (condensedStyle) {
        const { styling } = condensedStyle

        return {
          ...node,
          dom: `<span style="${styling.join('; ')}">${node.text}</span>`
        }
      }

      return node
    })

    /**
     * Construct the DOM
     */
    const constructedDOM = domNodes.map(node => node.dom || node.text).join('')
    return element.split('><').join(`>${constructedDOM}<`)
  })

  return dom.join('\n')
}

console.log(parser(Blocks))
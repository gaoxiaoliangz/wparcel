export default info => {
  const node = document.createElement('div')
  node.innerHTML = info
  document.body.appendChild(node)
}

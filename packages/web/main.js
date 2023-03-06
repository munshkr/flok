/* eslint-env browser */

import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { IndexeddbPersistence } from 'y-indexeddb'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness.js'

import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

import * as random from 'lib0/random'
import { EditorState } from '@codemirror/state'

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

export const userColor = usercolors[random.uint32() % usercolors.length]

const ydoc = new Y.Doc()

const awareness = new awarenessProtocol.Awareness(ydoc)
awareness.setLocalStateField('user', {
  name: 'Anonymous ' + Math.floor(Math.random() * 100),
  color: userColor.color,
  colorLight: userColor.light
})

const idbProvider = new IndexeddbPersistence('flok-room', ydoc)
idbProvider.on('synced', () => {
  console.log('Data from IndexexDB loaded')
})

const webrtcProvider = new WebrtcProvider('flok-room', ydoc, { awareness, signaling: ['ws://localhost:4444'] })

const wsProvider = new WebsocketProvider('ws://localhost:4445', 'flok-room', ydoc, { awareness })
wsProvider.on('status', event => {
  console.log(event.status) // logs "connected" or "disconnected"
})

const ytext = ydoc.getText('codemirror')

const state = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    keymap.of([
      ...yUndoManagerKeymap
    ]),
    basicSetup,
    javascript(),
    EditorView.lineWrapping,
    yCollab(ytext, awareness),
    oneDark
  ]
})

const view = new EditorView({ state, parent: (document.querySelector('#editor')) })

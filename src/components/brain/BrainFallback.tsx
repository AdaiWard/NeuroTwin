export default function BrainFallback({
  message = 'Загружаем анатомическую модель…',
}: {
  message?: string;
}) {
  return (
    <div className="brain-fallback" role="status">
      <svg
        viewBox="0 0 500 360"
        role="img"
        aria-label="Схематическая анатомическая иллюстрация мозга"
      >
        <defs>
          <linearGradient id="cortex" x2="1" y2="1">
            <stop stopColor="#aaa3d4" />
            <stop offset="1" stopColor="#303c64" />
          </linearGradient>
        </defs>
        <path
          fill="url(#cortex)"
          stroke="#a2b6ed"
          strokeWidth="2"
          d="M91 241C46 226 40 177 60 147C58 112 91 82 121 83C132 45 177 39 200 48C229 22 264 36 278 50C316 34 352 54 358 80C401 83 435 111 428 143C465 172 448 217 420 230C409 267 367 281 333 268L309 289L294 322L269 312L273 271C229 291 197 273 179 268C145 283 100 274 91 241Z"
        />
        <g fill="none" stroke="#242c4c" strokeWidth="7" strokeLinecap="round">
          <path d="M88 158C126 123 92 110 129 103C163 95 127 70 174 65M73 203C125 219 119 155 151 150C173 147 183 117 153 109M110 242C152 244 134 207 175 194C203 186 189 164 174 168M200 255C228 227 191 215 214 188C247 154 208 145 215 111C218 90 240 89 232 63M268 64C294 92 259 111 281 143C304 164 264 181 275 208M315 84C344 112 306 120 326 146C351 180 318 183 311 214M371 110C400 134 352 153 381 173C407 192 364 220 355 235M245 266C280 246 303 263 329 245M78 176C114 164 116 180 130 187" />
        </g>
      </svg>
      <p>{message}</p>
      <small>Управление областями доступно в списке.</small>
    </div>
  );
}

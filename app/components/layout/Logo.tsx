export default function Logo({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={30}
            zoomAndPan="magnify"
            viewBox="0 0 375 374.999991"
            height={30}
            preserveAspectRatio="xMidYMid meet"
            className={className}
        >
            <defs>
                <clipPath id="logo-1">
                    <path
                        d="M 30 59 L 325 59 L 325 146 L 30 146 Z M 30 59 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-2">
                    <path
                        d="M 27.738281 72.742188 L 321.933594 54.972656 L 326.585938 131.972656 L 32.390625 149.738281 Z M 27.738281 72.742188 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-3">
                    <path
                        d="M 248.386719 59.414062 C 289.003906 56.960938 322.976562 72.207031 324.257812 93.472656 C 325.542969 114.734375 293.65625 133.960938 253.035156 136.414062 L 105.9375 145.296875 C 65.316406 147.75 31.347656 132.503906 30.0625 111.242188 C 28.78125 89.976562 60.667969 70.75 101.289062 68.296875 L 248.386719 59.414062 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-4">
                    <path
                        d="M 28 238 L 322 238 L 322 316 L 28 316 Z M 28 238 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-5">
                    <path
                        d="M 25.410156 257.917969 L 319.035156 232.410156 L 324.535156 295.707031 L 30.910156 321.21875 Z M 25.410156 257.917969 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-6">
                    <path
                        d="M 245.628906 238.789062 C 286.171875 235.265625 320.269531 246.578125 321.785156 264.058594 C 323.304688 281.539062 291.671875 298.5625 251.128906 302.085938 L 104.316406 314.839844 C 63.777344 318.363281 29.679688 307.046875 28.160156 289.566406 C 26.640625 272.089844 58.277344 255.0625 98.816406 251.542969 L 245.628906 238.789062 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-7">
                    <path
                        d="M 25.410156 164.570312 L 320.140625 164.570312 L 320.140625 217.410156 L 25.410156 217.410156 Z M 25.410156 164.570312 "
                        clipRule="evenodd"
                    />
                </clipPath>
                <clipPath id="logo-8">
                    <path
                        d="M 246.460938 164.570312 C 287.152344 164.570312 320.140625 176.398438 320.140625 190.988281 C 320.140625 205.582031 287.152344 217.410156 246.460938 217.410156 L 99.09375 217.410156 C 58.398438 217.410156 25.410156 205.582031 25.410156 190.988281 C 25.410156 176.398438 58.398438 164.570312 99.09375 164.570312 L 246.460938 164.570312 "
                        clipRule="evenodd"
                    />
                </clipPath>
            </defs>
            <g clipPath="url(#logo-1)">
                <g clipPath="url(#logo-2)">
                    <g clipPath="url(#logo-3)">
                        <path
                            fill="currentColor"
                            d="M 27.738281 72.742188 L 321.933594 54.972656 L 326.585938 131.972656 L 32.390625 149.738281 Z M 27.738281 72.742188 "
                            fillOpacity={1}
                            fillRule="evenodd"
                        />
                    </g>
                </g>
            </g>
            <g clipPath="url(#logo-4)">
                <g clipPath="url(#logo-5)">
                    <g clipPath="url(#logo-6)">
                        <path
                            fill="currentColor"
                            d="M 25.410156 257.917969 L 319.035156 232.410156 L 324.535156 295.707031 L 30.910156 321.21875 Z M 25.410156 257.917969 "
                            fillOpacity={1}
                            fillRule="evenodd"
                        />
                    </g>
                </g>
            </g>
            <g clipPath="url(#logo-7)">
                <g clipPath="url(#logo-8)">
                    <path
                        fill="currentColor"
                        d="M 25.410156 164.570312 L 320.140625 164.570312 L 320.140625 217.410156 L 25.410156 217.410156 Z M 25.410156 164.570312 "
                        fillOpacity={1}
                        fillRule="evenodd"
                    />
                </g>
            </g>
        </svg>
    );
}

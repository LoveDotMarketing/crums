

## Add Password Visibility Toggle to Login

Add an eye icon button inside the password input field that toggles between showing and hiding the password text.

### File: `src/pages/Login.tsx`

1. Import `Eye` and `EyeOff` icons from lucide-react
2. Add `showPassword` state (boolean, default false)
3. Wrap the password input in a relative div, change input type from `"password"` to `showPassword ? "text" : "password"`
4. Add an absolutely-positioned button with Eye/EyeOff icon on the right side of the input


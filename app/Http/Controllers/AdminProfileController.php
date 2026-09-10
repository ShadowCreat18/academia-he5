<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AdminProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|string|min:8|confirmed',
            'photo' => 'nullable|image|max:10240', // 10MB max
        ]);

        $user->name = $request->name;
        $user->username = $request->username;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = uniqid('profile_') . '.' . $file->getClientOriginalExtension();
            
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->decode($file);
            $image->cover(300, 300); // Square profile photo
            
            $path = public_path('storage/photos/' . $filename);
            if (!file_exists(public_path('storage/photos'))) {
                mkdir(public_path('storage/photos'), 0755, true);
            }
            $image->save($path);
            $user->profile_photo_path = 'photos/' . $filename;
        }

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'La contraseña actual no es correcta.']);
            }
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return back()->with('success', 'Perfil actualizado correctamente.');
    }
}
